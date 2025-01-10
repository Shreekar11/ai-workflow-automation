import { Request, Response } from 'express';
import { GET } from '../../decorators/router';

export default class GetUserDataController {
    @GET('/v1/user')
    public async getUserData(req: Request, res: Response): Promise<Response> {
        return res.status(200).json({ message: 'User data' });
    }
}