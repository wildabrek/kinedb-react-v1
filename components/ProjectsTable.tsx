"use client"

import type React from "react"
import { useState } from "react"
import { Card, Icon, Menu, MenuItem } from "@mui/material"
import MDBox from "./MDBox"
import MDTypography from "./MDTypography"
import DataTable from "./DataTable"
import MDAvatar from "./MDAvatar"
import MDProgress from "./MDProgress"
import { useActions } from "@/contexts/action-context"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useRouter } from "next/navigation"
import { projects } from "@/utils/data" // Import projects from our data utility

function ProjectsTable() {
  const { toast } = useToast()
  const { viewDetails, editItem, deleteItem } = useActions()
  const [menu, setMenu] = useState<HTMLElement | null>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const openMenu = (event: React.MouseEvent<HTMLElement>, project: any) => {
    event.stopPropagation()
    setMenu(event.currentTarget)
    setSelectedProject(project)
  }

  const closeMenu = () => setMenu(null)

  const handleViewDetails = () => {
    if (selectedProject && selectedProject.id !== 0) {
      router.push(`/games/${selectedProject.id}`)
      closeMenu()
    } else {
      router.push("/games")
      closeMenu()
    }
  }

  const handleEdit = () => {
    if (selectedProject && selectedProject.id !== 0) {
      router.push(`/games/${selectedProject.id}/edit`)
      closeMenu()
    } else {
      toast({
        title: "Cannot Edit",
        description: "Please select a specific game to edit",
      })
      closeMenu()
    }
  }

  const handleDelete = () => {
    if (selectedProject && selectedProject.id !== 0) {
      setDeleteDialogOpen(true)
    } else {
      toast({
        title: "Cannot Delete",
        description: "Please select a specific game to delete",
      })
      closeMenu()
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedProject && selectedProject.id !== 0) {
      deleteItem("game", selectedProject.id, selectedProject.name)
      setDeleteDialogOpen(false)
      closeMenu()
    }
  }

  const Project = ({ image, name }: { image: string; name: string }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" variant="rounded" />
      <MDTypography display="block" variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  )

  const Progress = ({ color, value }: { color: string; value: number }) => (
    <MDBox display="flex" alignItems="center">
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {value}%
      </MDTypography>
      <MDBox ml={0.5} width="9rem">
        <MDProgress variant="gradient" color={color} value={value} />
      </MDBox>
    </MDBox>
  )

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
      <MenuItem onClick={handleEdit}>Edit</MenuItem>
      <MenuItem onClick={handleDelete}>Remove</MenuItem>
    </Menu>
  )

  const columns = [
    { Header: "game", accessor: "game", width: "30%", align: "left" },
    { Header: "students", accessor: "students", align: "left" },
    { Header: "completion", accessor: "completion", align: "center" },
    { Header: "avg. score", accessor: "avgScore", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ]

  const rows = projects.map((project) => ({
    game: <Project image="/placeholder.svg?height=40&width=40" name={project.name} />,
    students: (
      <MDTypography component="a" href="#" variant="button" color="text" fontWeight="medium">
        {project.students}
      </MDTypography>
    ),
    completion: (
      <Progress
        color={project.completion === 100 ? "success" : project.completion > 50 ? "info" : "error"}
        value={project.completion}
      />
    ),
    avgScore: (
      <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
        {project.avgScore}%
      </MDTypography>
    ),
    action: (
      <MDTypography
        component="a"
        href="#"
        color="text"
        onClick={(e) => openMenu(e, project)}
        sx={{ cursor: "pointer" }}
      >
        <Icon>more_vert</Icon>
      </MDTypography>
    ),
  }))

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Games Overview
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              done
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{projects.length} active</strong> games this month
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon
            sx={{ cursor: "pointer", fontWeight: "bold" }}
            fontSize="small"
            onClick={(e) => openMenu(e, { id: 0, name: "All Games" })}
          >
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>
      <MDBox>
        <DataTable
          table={{ columns, rows }}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Game"
        description={`Are you sure you want to delete ${selectedProject?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        variant="destructive"
      />
    </Card>
  )
}

export default ProjectsTable
