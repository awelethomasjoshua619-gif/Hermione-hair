import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })

      // Only overwrite req.body/query/params if the schema actually validated that part.
      // This prevents wiping out req.params.id (or req.query) when a schema
      // only validates the body — the root cause of the earlier order-status bug.
      if (parsed.body !== undefined) req.body = parsed.body
      if (parsed.query !== undefined) req.query = parsed.query
      if (parsed.params !== undefined) req.params = parsed.params

      next()
    } catch (error) {
      next(error)
    }
  }
}