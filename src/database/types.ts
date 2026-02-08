/**
 * OpenKernel EDU - Database Types
 * Type definitions for database entities
 * 
 * @module database/types
 */

import type { MultilingualText, DifficultyLevel } from '../contracts/tutorial-schema';

// =============================================================================
// DATABASE ENUMS (matching Prisma schema)
// =============================================================================

export type DbDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type DbCategory = 'basics' | 'algorithms' | 'games';
export type DbAchievementType =
    | 'first_program'
    | 'speed_demon'
    | 'polyglot'
    | 'all_lessons'
    | 'streak_7_days'
    | 'fibonacci_master'
    | 'loop_wizard'
    | 'memory_explorer';

export enum UserRole {
    GUEST = 'GUEST',
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
    ADMIN = 'ADMIN'
}

// =============================================================================
// DATABASE ENTITIES
// =============================================================================

/**
 * Lesson entity stored in database
 */
export interface DbLesson {
    id: string;
    title: MultilingualText;
    description: MultilingualText;
    emojiConcepts: string[];
    difficulty: DbDifficulty;
    estimatedMins: number;
    prerequisites: string[];
    tags: string[];
    author: string | null;
    version: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Lesson with steps included
 */
export interface DbLessonWithSteps extends DbLesson {
    steps: DbLessonStep[];
}

/**
 * Lesson step entity
 */
export interface DbLessonStep {
    id: string;
    lessonId: string;
    stepNumber: number;
    instruction: MultilingualText;
    emojiCode: string;
    expectedOutput: string[];
    hint: MultilingualText | null;
    explanation: MultilingualText | null;
    validationLogic: Record<string, unknown> | null;
}

/**
 * User progress entity
 */
export interface DbUserProgress {
    id: string;
    userId: string;
    lessonId: string;
    completedSteps: number[];
    currentStep: number;
    startedAt: Date;
    completedAt: Date | null;
    timeSpentSecs: number;
    hintsUsed: number;
    attempts: number;
}

/**
 * Example program entity
 */
export interface DbExampleProgram {
    id: string;
    title: MultilingualText;
    description: MultilingualText;
    emojiCode: string;
    category: DbCategory;
    difficulty: DbDifficulty;
    upvotes: number;
    authorId: string | null;
    expectedOutput: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Achievement entity
 */
export interface DbAchievement {
    id: string;
    userId: string;
    achievementType: DbAchievementType;
    earnedAt: Date;
    metadata: Record<string, unknown> | null;
}

/**
 * User entity
 */
export interface User {
    id: string;
    email: string;
    passwordHash: string | null;
    name: string | null;
    avatarUrl: string | null;
    role: UserRole;
    authorityLevel: number;
    provider: string | null;
    providerId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// =============================================================================
// INPUT TYPES (for creating/updating)
// =============================================================================

export interface CreateLessonInput {
    title: MultilingualText;
    description: MultilingualText;
    emojiConcepts: string[];
    difficulty: DbDifficulty;
    estimatedMins: number;
    prerequisites?: string[];
    tags?: string[];
    author?: string;
    steps: CreateLessonStepInput[];
}

export interface CreateLessonStepInput {
    stepNumber: number;
    instruction: MultilingualText;
    emojiCode: string;
    expectedOutput?: string[];
    hint?: MultilingualText;
    explanation?: MultilingualText;
    validationLogic?: Record<string, unknown>;
}

export interface UpdateLessonInput {
    title?: MultilingualText;
    description?: MultilingualText;
    emojiConcepts?: string[];
    difficulty?: DbDifficulty;
    estimatedMins?: number;
    prerequisites?: string[];
    tags?: string[];
}

export interface UpsertProgressInput {
    userId: string;
    lessonId: string;
    currentStep?: number;
    completedSteps?: number[];
    timeSpentSecs?: number;
    hintsUsed?: number;
    attempts?: number;
}

export interface CreateExampleInput {
    title: MultilingualText;
    description: MultilingualText;
    emojiCode: string;
    category: DbCategory;
    difficulty: DbDifficulty;
    expectedOutput?: string[];
    authorId?: string;
}

export interface CreateAchievementInput {
    userId: string;
    achievementType: DbAchievementType;
    metadata?: Record<string, unknown>;
}

export interface CreateUserInput {
    email: string;
    password?: string;
    name?: string;
    avatarUrl?: string;
    role?: UserRole;
    provider?: string;
    providerId?: string;
}

export interface UpdateUserInput {
    email?: string;
    password?: string;
    name?: string;
    avatarUrl?: string;
    role?: UserRole;
    authorityLevel?: number;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface LessonFilters {
    difficulty?: DbDifficulty;
    tags?: string[];
    search?: string;
}

export interface ExampleFilters {
    category?: DbCategory;
    difficulty?: DbDifficulty;
    authorId?: string;
    search?: string;
}

export interface PaginationOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
}
