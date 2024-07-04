-- CreateEnum
CREATE TYPE "Role" AS ENUM ('administrator', 'user');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "lock_out_until" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpiry" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'user',
    "two_factor_secret" TEXT,
    "verification_token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");
