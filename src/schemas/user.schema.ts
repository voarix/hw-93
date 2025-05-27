import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

export interface UserDocument extends Document, User {
  generateToken: () => void;
  checkPassword: (password: string) => Promise<boolean>;
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Prop({ required: true })
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function (this: UserDocument) {
  this.token = randomUUID();
};

UserSchema.methods.checkPassword = async function (
  this: UserDocument,
  password: string,
) {
  return await argon2.verify(this.password, password);
};

UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await argon2.hash(this.password, ARGON2_OPTIONS);
});

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});
