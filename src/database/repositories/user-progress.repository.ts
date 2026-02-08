/**
 * OpenKernel EDU - User Progress Repository (Prisma Implementation)
 * Manages user progress tracking with atomic updates
 * 
 * @module database/repositories/user-progress.repository
 */

import { prisma } from '../client';
import type { IUserProgressRepository } from './index';
import type {
    DbUserProgress,
    UpsertProgressInput,
} from '../types';

export class UserProgressRepository implements IUserProgressRepository {
    async getProgress(userId: string, lessonId: string): Promise<DbUserProgress | null> {
        const progress = await prisma.userProgress.findUnique({
            where: {
                userId_lessonId: { userId, lessonId },
            },
        });

        return progress ? this.mapToDbProgress(progress) : null;
    }

    async getAllProgress(userId: string): Promise<DbUserProgress[]> {
        const progressList = await prisma.userProgress.findMany({
            where: { userId },
            orderBy: { startedAt: 'desc' },
        });

        return progressList.map(this.mapToDbProgress);
    }

    async upsertProgress(data: UpsertProgressInput): Promise<DbUserProgress> {
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_lessonId: { userId: data.userId, lessonId: data.lessonId },
            },
            create: {
                userId: data.userId,
                lessonId: data.lessonId,
                currentStep: data.currentStep ?? 0,
                completedSteps: data.completedSteps ?? [],
                timeSpentSecs: data.timeSpentSecs ?? 0,
                hintsUsed: data.hintsUsed ?? 0,
                attempts: data.attempts ?? 0,
            },
            update: {
                ...(data.currentStep !== undefined && { currentStep: data.currentStep }),
                ...(data.completedSteps !== undefined && { completedSteps: data.completedSteps }),
                ...(data.timeSpentSecs !== undefined && { timeSpentSecs: { increment: data.timeSpentSecs } }),
                ...(data.hintsUsed !== undefined && { hintsUsed: { increment: data.hintsUsed } }),
                ...(data.attempts !== undefined && { attempts: { increment: data.attempts } }),
            },
        });

        return this.mapToDbProgress(progress);
    }

    async markStepComplete(userId: string, lessonId: string, stepNumber: number): Promise<DbUserProgress> {
        // First, get current progress or create new one
        const existing = await prisma.userProgress.findUnique({
            where: { userId_lessonId: { userId, lessonId } },
        });

        const currentSteps = existing?.completedSteps ?? [];
        const updatedSteps = currentSteps.includes(stepNumber)
            ? currentSteps
            : [...currentSteps, stepNumber];

        const progress = await prisma.userProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            create: {
                userId,
                lessonId,
                currentStep: stepNumber + 1,
                completedSteps: [stepNumber],
                attempts: 1,
            },
            update: {
                completedSteps: updatedSteps,
                currentStep: Math.max(existing?.currentStep ?? 0, stepNumber + 1),
                attempts: { increment: 1 },
            },
        });

        return this.mapToDbProgress(progress);
    }

    async addTimeSpent(userId: string, lessonId: string, seconds: number): Promise<void> {
        await prisma.userProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            create: {
                userId,
                lessonId,
                timeSpentSecs: seconds,
            },
            update: {
                timeSpentSecs: { increment: seconds },
            },
        });
    }

    async markLessonComplete(userId: string, lessonId: string): Promise<DbUserProgress> {
        const progress = await prisma.userProgress.update({
            where: { userId_lessonId: { userId, lessonId } },
            data: {
                completedAt: new Date(),
            },
        });

        return this.mapToDbProgress(progress);
    }

    async getStats(userId: string): Promise<{
        totalLessons: number;
        completedLessons: number;
        totalTimeSpent: number;
        totalHintsUsed: number;
    }> {
        const progressList = await prisma.userProgress.findMany({
            where: { userId },
        });

        const totalLessons = progressList.length;
        const completedLessons = progressList.filter(p => p.completedAt !== null).length;
        const totalTimeSpent = progressList.reduce((sum: number, p: any) => sum + p.timeSpentSecs, 0);
        const totalHintsUsed = progressList.reduce((sum: number, p: any) => sum + p.hintsUsed, 0);

        return {
            totalLessons,
            completedLessons,
            totalTimeSpent,
            totalHintsUsed,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapToDbProgress(progress: any): DbUserProgress {
        return {
            id: progress.id,
            userId: progress.userId,
            lessonId: progress.lessonId,
            completedSteps: progress.completedSteps,
            currentStep: progress.currentStep,
            startedAt: progress.startedAt,
            completedAt: progress.completedAt,
            timeSpentSecs: progress.timeSpentSecs,
            hintsUsed: progress.hintsUsed,
            attempts: progress.attempts,
        };
    }
}

// Export singleton instance
export const userProgressRepository = new UserProgressRepository();
