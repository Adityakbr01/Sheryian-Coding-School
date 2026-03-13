import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'

export const validate = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    issues: error.flatten().fieldErrors,
                })
            }
            next(error)
        }
    }
}
