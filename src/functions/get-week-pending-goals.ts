import dayjs from "dayjs"
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema' 
import { count, gte, lte, sql, and, eq } from "drizzle-orm"

export async function getWeekPendingGoals() {
    const lastDayOfWeek = dayjs().endOf('week').toDate()
    const firstDayOfWeek = dayjs().startOf('week').toDate()

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        db.select({
            id: goals.id,
            title: goals.title,
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            createdAt: goals.createdAt
        }).from(goals).where(lte(goals.createdAt, lastDayOfWeek))
        )
    

        const goalsCompletionCount = db.$with('goal_completion_counts').as(
            db.select({
                completionCount: count(goalCompletions.id).as('completionCount'),
                goalId: goalCompletions.id
            }
            ).from(goalCompletions).where(and(gte(goals.createdAt, firstDayOfWeek),lte(goals.createdAt, lastDayOfWeek)
        )).groupBy(goalCompletions.goalId)
        )

        const pendingGoals = await db
        .with(goalsCreatedUpToWeek, goalsCompletionCount)
        .select({
            id: goalsCreatedUpToWeek.id,
            title: goalsCreatedUpToWeek.title,
            desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
            completionCount: sql`COALESCE(${goalsCompletionCount},0)`.mapWith(Number),
        })
        .from(goalsCreatedUpToWeek)
        .leftJoin( goalsCompletionCount, eq(goalsCompletionCount.goalId, goalsCreatedUpToWeek.id)
    )

        return { pendingGoals }
}