import { View } from "../View"
import { cached, Monitor, options, Reentrance, Ref, transaction, Transaction, unobservable } from "reactronic"
import { Database } from "../../database"
import * as domain from "../../domain"
import { TaskEditor } from "./TaskEditor"
import { SolutionEditor } from "./SolutionEditor"
import { SolutionRunner } from "./SolutionRunner"
import { TasksExplorer } from "../tasks"
import MarkdownIt from "markdown-it"

export class TasksView extends View {
    @unobservable readonly tasksExplorer: TasksExplorer
    private static readonly s_monitor = Monitor.create("tasks-monitor", 0, 0)
    private static readonly s_markdown = new MarkdownIt()
    @unobservable private readonly _database: Database
    private _taskEditor: TaskEditor | null = null
    private _solutionEditor: SolutionEditor | null = null
    private _solutionRunner: SolutionRunner | null = null

    override get sidePanelTitle(): string {
        if (this._taskEditor)
            return "Edit task"
        if (this._solutionEditor)
            return "Edit solution"
        if (this._solutionRunner)
            return "Run solution"
        return "Tasks"
    }
    override get isPerformingOperation(): boolean {
        return TasksView.s_monitor.isActive || (this._solutionRunner?.isLoadingApplication ?? false)
    }
    get taskEditor(): TaskEditor | null { return this._taskEditor }
    get solutionEditor(): SolutionEditor | null { return this._solutionEditor }
    get solutionRunner(): SolutionRunner | null { return this._solutionRunner }
    @cached get taskDescriptionHtml(): string | null {
        const description = this.tasksExplorer.selectedNode?.item.description
        if (!description)
            return null
        return TasksView.s_markdown.render(description)
    }

    constructor(id: string, database: Database) {
        super(id)
        this._database = database
        this.tasksExplorer = new TasksExplorer(new Ref(this._database, "courses"))
    }

    override dispose(): void {
        Transaction.run(() => {
            this._solutionRunner?.dispose()
            this._solutionEditor?.dispose()
            this._taskEditor?.dispose()
            this.tasksExplorer.dispose()
            super.dispose()
        })
    }

    @transaction
    updateTask(task: domain.Task): void {
        this.ensureCanPerformOperation()
        this._taskEditor = new TaskEditor(task)
    }

    @transaction
    createTask(course: domain.Course): void {
        this.ensureCanPerformOperation()
        const task = new domain.Task(domain.Task.NO_ID, course, "", "")
        task.solutions = []
        this._taskEditor = new TaskEditor(task)
    }

    @transaction @options({ monitor: TasksView.s_monitor })
    async deleteTask(task: domain.Task): Promise<void> {
        this.ensureCanPerformOperation()
        await this._database.deleteTask(task)
    }

    @transaction
    cancelTaskEditing(): void {
        this._taskEditor?.dispose()
        this._taskEditor = null
    }

    @transaction @options({ monitor: TasksView.s_monitor })
    async saveEditedTask(): Promise<void> {
        if (this._taskEditor) {
            const task = this._taskEditor.getTask()
            if (task.id === domain.Task.NO_ID)
                await this._database.createTask(task)
            else
                await this._database.updateTask(task)
            this._taskEditor.dispose()
            this._taskEditor = null
        }
    }

    @transaction
    createSolution(task: domain.Task): void {
        this.ensureCanPerformOperation()
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "")
        this._solutionEditor = new SolutionEditor(solution)
    }

    @transaction @options({ monitor: TasksView.s_monitor, reentrance: Reentrance.WaitAndRestart })
    async deleteSolution(solution: domain.Solution): Promise<void> {
        await this._database.deleteSolution(solution)
    }

    @transaction
    cancelSolutionEditing(): void {
        this._solutionEditor?.dispose()
        this._solutionEditor = null
    }

    @transaction @options({ monitor: TasksView.s_monitor })
    async saveEditedSolution(): Promise<void> {
        if (this._solutionEditor) {
            const solution = this._solutionEditor.getSolution()
            if (solution.id === domain.Solution.NO_ID)
                await this._database.createSolution(solution)
            this._solutionEditor.dispose()
            this._solutionEditor = null
        }
    }

    @transaction
    runSolution(solution: domain.Solution): void {
        this.ensureCanPerformOperation()
        this._solutionRunner = new SolutionRunner(solution)
    }

    @transaction
    async stopSolution(): Promise<void> {
        await this._solutionRunner?.dispose()
        this._solutionRunner = null
    }

    private ensureCanPerformOperation(): void {
        if (this._taskEditor)
            throw new Error("Task being edited")
        if (this._solutionEditor)
            throw new Error("Solution being viewed")
        if (this._solutionRunner)
            throw new Error("Demo being viewed")
    }
}
