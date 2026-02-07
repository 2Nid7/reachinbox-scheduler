import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing user information' });
    }

    // Find or create user
    let user = await User.findOne({ where: { googleId } });

    if (!user) {
      user = await User.create({
        email,
        name,
        avatar: picture,
        googleId,
      });
    } else {
      // Update user info
      await user.update({
        name,
        avatar: picture,
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};