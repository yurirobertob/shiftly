import type { Meta, StoryObj } from "@storybook/react"
import { LinearProgress, CircularProgress } from "@/components/ui/progress"

const meta: Meta = {
  title: "UI/Progress",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
}

export default meta

export const LinearDeterminate: StoryObj<typeof LinearProgress> = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <LinearProgress value={0} />
      <LinearProgress value={25} />
      <LinearProgress value={50} />
      <LinearProgress value={75} />
      <LinearProgress value={100} color="success" />
    </div>
  ),
}

export const LinearIndeterminate: StoryObj<typeof LinearProgress> = {
  render: () => <LinearProgress indeterminate className="w-full max-w-sm" />,
}

export const CircularDeterminate: StoryObj<typeof CircularProgress> = {
  render: () => (
    <div className="flex items-center gap-4">
      <CircularProgress value={25} />
      <CircularProgress value={50} color="success" />
      <CircularProgress value={75} color="warning" />
      <CircularProgress value={100} color="primary" />
    </div>
  ),
}

export const CircularIndeterminate: StoryObj<typeof CircularProgress> = {
  render: () => <CircularProgress indeterminate />,
}
