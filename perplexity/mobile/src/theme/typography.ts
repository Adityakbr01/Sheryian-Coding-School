import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'NeueMachina-Medium',
  android: 'NeueMachina-Medium',
  default: 'System',
});

export const typography = {
    fonts: {
        juana: "Fontspring-Juana",
        neueMedium: "NeueMachina-Medium",
        neueLight: "NeueMachina-Light",
        neueRegular: "NeueMachina-Regular",
        neueBold: "NeueMachina-Bold",
        helveticaMedium: "HelveticaNow-Medium",
        helveticaRegular: "HelveticaNow-Regular",
        helveticaLight: "HelveticaNow-Light",
        helveticaBold: "HelveticaNow-Bold",
    },
    sizes: {
        h1: 28,
        h2: 24,
        body: 16,
        button: 18,
        small: 15,
    },
    weights: {
        bold: "700" as const,
        semiBold: "600" as const,
        medium: "500" as const,
        regular: "400" as const,
    }
};
