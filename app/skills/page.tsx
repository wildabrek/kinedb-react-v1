"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createSkill, deleteSkill, getSkills, getSubjects, updateSkill } from "@/lib/api";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "", subject_id: "", level: "" });
  const [editSkill, setEditSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const skillsData = await getSkills();
      const subjectsData = await getSubjects();
      setSkills(skillsData);
      setSubjects(subjectsData);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = async () => {
    try {
      const newSkill = await createSkill(formData);
      setSkills((prev) => [...prev, newSkill]);
      setFormData({ name: "", description: "", subject_id: "", level: "" });
      setOpenAddDialog(false);
      toast({ title: "Success", description: "Skill added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add skill" });
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.skill_id !== id));
      toast({ title: "Deleted", description: "Skill deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete skill" });
    }
  };

  const handleUpdateSkill = async () => {
    try {
      const updatedSkill = await updateSkill(editSkill.skill_id, formData);
      setSkills((prev) => prev.map((s) => (s.skill_id === updatedSkill.skill_id ? updatedSkill : s)));
      setEditSkill(null);
      toast({ title: "Updated", description: "Skill updated successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to update skill" });
    }
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedSkills = filteredSkills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSkills.length / itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Manage your skill list</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Search skills" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button>Add Skill</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <Input name="name" placeholder="Skill Name" value={formData.name} onChange={handleChange} />
                <Input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.subject_id} value={String(subject.subject_id)}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="level" placeholder="Level" value={formData.level} onChange={handleChange} />
                <Button onClick={handleAddSkill}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {paginatedSkills.map((skill) => (
          <div key={skill.skill_id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-medium">{skill.name}</div>
              <div className="text-sm text-muted-foreground">{skill.description}</div>
              <div className="text-sm">Subject: {subjects.find((s) => s.subject_id === skill.subject_id)?.name || skill.subject_id}</div>
              <div className="text-sm">Level: {skill.level}</div>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditSkill(skill);
                      setFormData({
                        name: skill.name,
                        description: skill.description,
                        subject_id: String(skill.subject_id),
                        level: skill.level,
                      });
                    }}
                  >
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Skill</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <Input name="name" placeholder="Skill Name" value={formData.name} onChange={handleChange} />
                    <Input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                    <Select
                      value={formData.subject_id}
                      onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.subject_id} value={String(subject.subject_id)}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input name="level" placeholder="Level" value={formData.level} onChange={handleChange} />
                    <Button onClick={handleUpdateSkill}>Update Skill</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" onClick={() => handleDeleteSkill(skill.skill_id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={i + 1 === currentPage ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
