"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Github, GitBranch, GitCommit, GitPullRequest } from "lucide-react"

export default function GitHubSetup() {
  const [repoName, setRepoName] = useState("baccarat-trading-system")
  const [repoDescription, setRepoDescription] = useState("A trading system for baccarat games")
  const [isPrivate, setIsPrivate] = useState(true)
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: "Create a GitHub Repository",
      description: "First, create a new repository on GitHub",
      instructions: [
        "Go to GitHub.com and sign in to your account",
        "Click the '+' icon in the top right and select 'New repository'",
        "Enter your repository name",
        "Add an optional description",
        "Choose whether the repository should be public or private",
        "Click 'Create repository'",
      ],
    },
    {
      title: "Initialize Git in Your Project",
      description: "Set up Git in your local project directory",
      instructions: [
        "Open a terminal or command prompt",
        "Navigate to your project directory",
        "Run: git init",
        "Run: git add .",
        'Run: git commit -m "Initial commit"',
      ],
    },
    {
      title: "Connect to GitHub",
      description: "Link your local repository to GitHub",
      instructions: [
        "Run: git remote add origin https://github.com/YOUR-USERNAME/baccarat-trading-system.git",
        "Run: git branch -M main",
        "Run: git push -u origin main",
      ],
    },
    {
      title: "Verify Your Repository",
      description: "Check that everything is working correctly",
      instructions: [
        "Go to your GitHub repository page",
        "You should see all your project files",
        "Your code is now on GitHub!",
      ],
    },
  ]

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Github className="mr-2 h-6 w-6" />
            GitHub Setup Guide
          </CardTitle>
          <CardDescription>Follow these steps to push your baccarat trading system to GitHub</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-8">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    step > index + 1
                      ? "bg-green-100 text-green-600"
                      : step === index + 1
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 ${step > index + 1 ? "bg-green-200" : "bg-gray-200"}`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              {step === 1 && <GitBranch className="mr-2 h-5 w-5 text-blue-500" />}
              {step === 2 && <GitCommit className="mr-2 h-5 w-5 text-blue-500" />}
              {step === 3 && <Github className="mr-2 h-5 w-5 text-blue-500" />}
              {step === 4 && <GitPullRequest className="mr-2 h-5 w-5 text-blue-500" />}
              {steps[step - 1].title}
            </h3>
            <p className="text-gray-600 mb-4">{steps[step - 1].description}</p>

            <div className="bg-gray-50 p-4 rounded-md border mb-4">
              <ol className="list-decimal pl-5 space-y-2">
                {steps[step - 1].instructions.map((instruction, index) => (
                  <li key={index} className="text-sm">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="baccarat-trading-system"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repo-description">Repository Description (optional)</Label>
                  <Textarea
                    id="repo-description"
                    value={repoDescription}
                    onChange={(e) => setRepoDescription(e.target.value)}
                    placeholder="A trading system for baccarat games"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-private"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(!!checked)}
                  />
                  <Label htmlFor="is-private">Private repository</Label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
                <div className="mb-2">$ git remote add origin https://github.com/YOUR-USERNAME/{repoName}.git</div>
                <div className="mb-2">$ git branch -M main</div>
                <div>$ git push -u origin main</div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            Previous
          </Button>
          <Button onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>
            Next Step <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Git Commands Cheat Sheet</CardTitle>
          <CardDescription>Common Git commands you might need</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Commands</h4>
              <div className="bg-gray-50 p-3 rounded-md border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-mono">git status</div>
                  <div>Check the status of your repository</div>

                  <div className="font-mono">git add .</div>
                  <div>Stage all changes for commit</div>

                  <div className="font-mono">git commit -m "message"</div>
                  <div>Commit staged changes with a message</div>

                  <div className="font-mono">git push</div>
                  <div>Push commits to the remote repository</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Working with Branches</h4>
              <div className="bg-gray-50 p-3 rounded-md border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-mono">git branch</div>
                  <div>List all local branches</div>

                  <div className="font-mono">git branch branch-name</div>
                  <div>Create a new branch</div>

                  <div className="font-mono">git checkout branch-name</div>
                  <div>Switch to a branch</div>

                  <div className="font-mono">git merge branch-name</div>
                  <div>Merge a branch into the current branch</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

