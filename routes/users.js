import express from 'express';
import userService from "../services/userService.js";
import { tokenAuthenticated } from '../middlewares/tokenMiddleware.js';
import { User } from '../db/index.js';
import bcrypt from 'bcrypt';

export const userRouter = express.Router();

//회원 정보 조회
userRouter.get('/:userId', tokenAuthenticated, async (req, res, next) => {
    try {
        const userId = req.params.userId
        const searchUser = await userService.getUserInfo(userId);

        res.status(200).json({
            username: searchUser.username,
            email: searchUser.email,
            password: searchUser.password,
            phone: searchUser.phone,
            address: searchUser.address,
            detailAddress: searchUser.detailAddress,
        })
    } catch (error) {
        next(error); // 에러를 다음 미들웨어로 전달
    }
})

//회원 정보 수정
userRouter.put('/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const { username, email, password, phone, address, detailAddress } = req.body;

        // 업데이트할 사용자 정보 객체 생성
        const updatedInfo = {
            username,
            email,
            password,
            phone,
            address,
            detailAddress
        };

        // 패스워드가 전달되었을 경우 해싱
        if (password) {
            updatedInfo.password = await bcrypt.hash(password, 10);
        }

        // 사용자 정보 업데이트
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            { $set: updatedInfo },
            { new: true }
        );

        // 업데이트된 사용자 정보 반환
        res.status(200).json({
            message: '회원 정보가 수정되었습니다.',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
});

// 회원 탈퇴
userRouter.patch('/:userId/delete', tokenAuthenticated, async (req, res, next) => {
    try {
        const userId = req.params.userId;
        await User.findOneAndDelete({ userId: userId });

        res.status(200).json({
            message: '회원 탈퇴가 완료되었습니다.'
        });
    } catch (error) {
        next(error);
    }
});