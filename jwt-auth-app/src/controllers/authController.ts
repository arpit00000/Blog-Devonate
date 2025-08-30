import { Request, Response } from 'express';
import User from '../models/userModel';
import { generateToken } from '../utils/jwt';

class AuthController {
    async signUp(req: Request, res: Response) {
        const { username, password, email } = req.body;

        try {
            const newUser = new User({ username, password, email });
            await newUser.save();
            const token = generateToken(newUser._id);
            res.status(201).json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Error signing up user', error });
        }
    }

    async signIn(req: Request, res: Response) {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ username });
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = generateToken(user._id);
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Error signing in user', error });
        }
    }
}

export default new AuthController();