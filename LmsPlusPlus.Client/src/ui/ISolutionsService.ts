import * as domain from "../domain"

export interface ISolutionsService {
    createSolution(task: domain.Task): void

    deleteSolution(solution: domain.Solution): void

    openSolutions(task: domain.Task): void

    runSolution(solution: domain.Solution): void
}
