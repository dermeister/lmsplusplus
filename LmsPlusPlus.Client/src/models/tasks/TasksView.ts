import { View } from "../View"
import { cached, Monitor, options, Reentrance, Ref, transaction, Transaction, unobservable } from "reactronic"
import { Database } from "../../database"
import * as domain from "../../domain"
import { TaskEditor } from "./TaskEditor"
import { SolutionEditor } from "./SolutionEditor"
import { DemoViewer } from "./DemoViewer"
import { TasksExplorer } from "../tasks"
import MarkdownIt from "markdown-it"

export class TasksView extends View {
    @unobservable readonly tasksExplorer: TasksExplorer
    private static readonly monitor = Monitor.create("tasks-monitor", 0, 0)
    private static readonly markdown = new MarkdownIt()
    @unobservable private readonly database: Database
    private _taskEditor: TaskEditor | null = null
    private _solutionEditor: SolutionEditor | null = null
    private _demoViewer: DemoViewer | null = null

    override get sidePanelTitle(): string {
        if (this._taskEditor)
            return "Edit task"
        if (this._solutionEditor)
            return "Edit solution"
        if (this._demoViewer)
            return "View demonstrations"
        return "Tasks"
    }
    get taskEditor(): TaskEditor | null { return this._taskEditor }
    get solutionEditor(): SolutionEditor | null { return this._solutionEditor }
    get demoViewer(): DemoViewer | null { return this._demoViewer }
    get monitor(): Monitor { return TasksView.monitor }
    @cached get taskDescriptionHtml(): string | null {
        const description = this.tasksExplorer.selectedTask?.description
        if (!description)
            return null
        return TasksView.markdown.render(description)
    }

    constructor(id: string, database: Database) {
        super(id)
        this.database = database
        this.tasksExplorer = new TasksExplorer(new Ref(this.database, "courses"))
    }

    override dispose(): void {
        Transaction.run(() => {
            this._demoViewer?.dispose()
            this._solutionEditor?.dispose()
            this._taskEditor?.dispose()
            this.tasksExplorer.dispose()
            super.dispose()
        })
    }

    @transaction
    updateTask(task: domain.Task): void {
        this.validateState()
        this._taskEditor = new TaskEditor(task)
    }

    @transaction
    createTask(course: domain.Course): void {
        this.validateState()
        const task = new domain.Task(domain.Task.NO_ID, course, "", "")
        task.solutions = []
        this._taskEditor = new TaskEditor(task)
    }

    @transaction @options({ monitor: TasksView.monitor })
    async deleteTask(task: domain.Task): Promise<void> {
        this.validateState()
        await this.database.deleteTask(task)
    }

    @transaction
    cancelTaskEditing(): void {
        this._taskEditor?.dispose()
        this._taskEditor = null
    }

    @transaction @options({ monitor: TasksView.monitor })
    async saveEditedTask(): Promise<void> {
        if (this._taskEditor) {
            const task = this._taskEditor.getTask()
            if (task.id === domain.Task.NO_ID)
                await this.database.createTask(task)
            else
                await this.database.updateTask(task)
            this._taskEditor.dispose()
            this._taskEditor = null
        }
    }

    @transaction
    createSolution(task: domain.Task): void {
        this.validateState()
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "")
        this._solutionEditor = new SolutionEditor(solution)
    }

    @transaction @options({ monitor: TasksView.monitor, reentrance: Reentrance.WaitAndRestart })
    async deleteSolution(solution: domain.Solution): Promise<void> {
        await this.database.deleteSolution(solution)
    }

    @transaction
    cancelSolutionEditing(): void {
        this._solutionEditor?.dispose()
        this._solutionEditor = null
    }

    @transaction @options({ monitor: TasksView.monitor })
    async saveEditedSolution(): Promise<void> {
        if (this._solutionEditor) {
            const solution = this._solutionEditor.getSolution()
            if (solution.id === domain.Solution.NO_ID)
                await this.database.createSolution(solution)
            this._solutionEditor.dispose()
            this._solutionEditor = null
        }
    }

    @transaction
    viewDemos(task: domain.Task): void {
        this.validateState()
        this._demoViewer = new DemoViewer(task)
    }

    @transaction
    closeDemoViewer(): void {
        this._demoViewer?.dispose()
        this._demoViewer = null
    }

    private validateState(): void {
        if (this._taskEditor)
            throw new Error("task being edited")
        if (this._solutionEditor)
            throw new Error("solution being viewed")
        if (this._demoViewer)
            throw new Error("demo being viewed")
    }
}
