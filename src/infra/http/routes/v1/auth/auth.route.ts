import { Router } from 'express';
import { LoginController } from '@/modules/auth/usecase/login/login.controller';
import { RefreshController } from '@/modules/auth/usecase/refresh/refresh.controller';

const routes = Router();

const loginController = new LoginController();
const refreshController = new RefreshController();

routes.post('/login', (req, res) => loginController.handle(req, res));
routes.post('/refresh', (req, res) => refreshController.handle(req, res));

export { routes };
