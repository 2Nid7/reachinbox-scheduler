import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { syncDatabase, User } from './src/models';

dotenv.config();

const createTestUser = async () => {
  try {
    await syncDatabase();

    // Try to find existing user first
    let user = await User.findOne({
      where: { email: 'test@example.com' },
    });

    if (user) {
      console.log('✅ Found existing test user:', user.toJSON());
    } else {
      // Create new user if doesn't exist
      user = await User.create({
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'test-google-id-123',
        avatar: 'https://via.placeholder.com/150',
      });
      console.log('✅ Test user created:', user.toJSON());
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('\n🎫 JWT Token (copy this):');
    console.log(token);
    console.log('\n📋 Use this token in Postman Authorization header as Bearer Token');
    console.log('\n✅ Token is valid for 7 days');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser();