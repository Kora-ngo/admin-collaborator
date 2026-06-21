import type { Request, Response } from "express"

const HealthController = {
    health: async (req: Request, res: Response) => {
        res.status(200).json({ status: "ok" })
    }
}

export default HealthController;