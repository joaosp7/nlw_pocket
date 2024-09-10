
import { goalCompletions, goals } from "./schema";
import { client, db } from '.'

async function seed() {
    await db.delete(goalCompletions)
    await db.delete(goals)

   const result = await db.insert(goals).values([
        {title: 'Acordar cedo', desiredWeeklyFrequency: 5},
        {title: 'Tomar Café', desiredWeeklyFrequency: 2},
        {title: 'Fazer almoço', desiredWeeklyFrequency: 3}

    ]).returning()
    await db.insert(goalCompletions).values([
        {goalId: result[0].id, createdAt: new Date()},
        {goalId: result[0].id, createdAt: new Date()}
    ])
}

seed().finally( () => {
    client.end()
})