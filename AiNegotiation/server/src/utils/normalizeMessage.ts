/**
 * PHASE 1: Normalize user messages before sending to LLM.
 * Converts price shorthand into explicit ₹ values.
 *
 * "i want in 2k"     → "i want in ₹2,000"
 * "20k final"        → "₹20,000 final"
 * "free mein de do"  → "₹0 mein de do"
 * "zero"             → "₹0"
 * "1.5k"             → "₹1,500"
 * "50 hazar"         → "₹50,000"
 * "1 lakh"           → "₹1,00,000"
 */
export function normalizeMessage(raw: string): string {
    let msg = raw.toLowerCase();

    // Handle zero / free / muft → ₹0
    msg = msg.replace(/\b(0|zero|free|muft|mufat)\b/g, '₹0');

    // Handle K format: 2k → ₹2,000 | 1.5k → ₹1,500 | 25K → ₹25,000
    msg = msg.replace(/₹?\s*(\d+(?:\.\d+)?)\s*[kK]\b/g, (_, num) => {
        const value = parseFloat(num) * 1000;
        return `₹${value.toLocaleString('en-IN')}`;
    });

    // Handle "X lakh" / "X lac"
    msg = msg.replace(/₹?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)\b/gi, (_, num) => {
        const value = parseFloat(num) * 100000;
        return `₹${value.toLocaleString('en-IN')}`;
    });

    // Handle "X hazar" / "X hazaar"
    msg = msg.replace(/₹?\s*(\d+(?:\.\d+)?)\s*(?:hazar|hazaar|hajar|hzar)\b/gi, (_, num) => {
        const value = parseFloat(num) * 1000;
        return `₹${value.toLocaleString('en-IN')}`;
    });

    // Handle raw numbers (e.g. "3000" -> "₹3,000")
    // Only match if it's a standalone number not already prefixed with ₹
    msg = msg.replace(/(?<![₹\d])\b(\d{3,})\b(?!\s*[kKkLh])/g, (_, num) => {
        const value = parseInt(num);
        return `₹${value.toLocaleString('en-IN')}`;
    });

    return msg;
}

/**
 * PHASE 2: Extract the first price value from a text string.
 * Returns the numeric value or null if no price found.
 */
export function extractPrice(text: string): number | null {
    // Match ₹ followed by digits, OR a standalone number that looks like a price (3+ digits)
    const match = text.match(/₹\s*(\d+(?:,\d{2,3})*(?:\.\d+)?)|(?<!\d)(\d{3,})(?!\d)/);
    if (!match) return null;

    // Use whichever group matched
    const valueStr = match[1] || match[2] || '0';
    return parseFloat(valueStr.replace(/,/g, ''));
}

/**
 * PHASE 6: Validate that the AI response correctly echoes the buyer's price.
 * Returns true if prices match or if no price comparison is possible.
 */
export function validatePriceEcho(userMsg: string, aiMsg: string): boolean {
    const userPrice = extractPrice(userMsg);
    if (userPrice === null) return true; // No price in user message, nothing to validate

    // Strongest signal: if AI says "X ka offer", every such X must match buyer price exactly.
    const offerPriceMatches = [...aiMsg.matchAll(/(?:₹\s*)?(\d+(?:,\d{2,3})*(?:\.\d+)?)\s*ka\s+offer/gi)];
    if (offerPriceMatches.length > 0) {
        const offerPrices = offerPriceMatches.map((m) => parseFloat((m[1] ?? '0').replace(/,/g, '')));
        return offerPrices.every((p) => p === userPrice);
    }

    // Check if the AI mentions the buyer's price correctly somewhere in the response
    const aiMentionedPrices = [...aiMsg.matchAll(/₹\s*(\d+(?:,\d{2,3})*(?:\.\d+)?)/g)];
    if (aiMentionedPrices.length === 0) return true; // AI didn't mention any price

    // At least one price in AI response should match the user's price
    const aiPrices = aiMentionedPrices.map((m) => parseFloat((m[1] ?? '0').replace(/,/g, '')));
    return aiPrices.some((p) => p === userPrice);
}

/**
 * PHASE 8: Hard-fix any price hallucinations in AI response.
 * Ensures that mentioned prices ALWAYS match either the correct buyer price
 * or the correct system seller price.
 */
export function hardFixBuyerPrice(aiMsg: string, correctBuyerPrice: number, sellerPrice: number): string {
    const formattedBuyerPrice = `₹${correctBuyerPrice.toLocaleString('en-IN')}`;

    // Force all "X ka offer" mentions to use the buyer's exact offer value.
    let fixedMsg = aiMsg.replace(
        /(?:₹\s*)?\d+(?:,\d{2,3})*(?:\.\d+)?\s*ka\s+offer/gi,
        `${formattedBuyerPrice} ka offer`,
    );

    // Replace all ₹ price patterns
    fixedMsg = fixedMsg.replace(/₹\s*\d+(?:,\d{2,3})*(?:\.\d+)?/g, (match) => {
        const value = parseFloat(match.replace(/[₹,\s]/g, ''));

        // If it matches exactly one of them, leave it alone
        if (value === correctBuyerPrice || value === sellerPrice) return match;

        // If it's closer to the seller price, it's likely a seller price hallucination
        const distToSeller = Math.abs(value - sellerPrice);
        const distToBuyer = Math.abs(value - correctBuyerPrice);

        if (distToSeller < distToBuyer) {
            return `₹${sellerPrice.toLocaleString('en-IN')}`;
        } else {
            return `₹${correctBuyerPrice.toLocaleString('en-IN')}`;
        }
    });

    return fixedMsg;
}
