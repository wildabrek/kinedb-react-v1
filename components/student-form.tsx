// components/student-form.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface StudentFormProps {
  student?: any;
  classes: any[];
  allGames: any[];
  studentPerformanceHistory: any[];
  possibleStrengths: any[];
  possibleAreas: any[];
  onSubmit: (data: any) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  classes,
  allGames,
  studentPerformanceHistory,
  possibleStrengths,
  possibleAreas,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    student_external_id: student?.student_external_id || '',
    email: student?.email || '',
    class_id: student?.class_id || '',
    avatar: student?.avatar || '',
    status: student?.status || 'Active',
    plp_overall_recommendation: student?.plp_overall_recommendation || '',
    plp_teacher_notes: student?.plp_teacher_notes || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-4 shadow-sm">
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">İsim Soyisim *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="student_external_id">Öğrenci No (Harici ID)</Label>
              <Input
                type="text"
                id="student_external_id"
                name="student_external_id"
                value={formData.student_external_id}
                onChange={handleInputChange}
              />
              <div className="form-text small">Okulun kullandığı sistemdeki ID (varsa).</div>
            </div>
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <div className="form-text small">İletişim veya sistem girişi için (opsiyonel).</div>
            </div>
            <div>
              <Label htmlFor="class_id">Sınıf *</Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) => handleSelectChange("class_id", value)}
                required
              >
                <SelectTrigger id="class_id">
                  <SelectValue placeholder="-- Sınıf Seçin --" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.class_id} value={classItem.class_id}>
                      {classItem.class_name} ({classItem.grade_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                type="text"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="örn: /static/images/avatars/avatar1.png"
              />
              <div className="form-text small">Profilde gösterilecek resmin adresi (opsiyonel).</div>
            </div>
            <div>
              <Label htmlFor="status">Durum *</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Aktif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Aktif</SelectItem>
                  <SelectItem value="Inactive">Pasif</SelectItem>
                  <SelectItem value="Graduated">Mezun</SelectItem>
                  <SelectItem value="Transferred">Nakil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-sm">
        <CardHeader>
          <CardTitle>Performans & Plan (PLP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="plp_overall_recommendation">Genel Öneri (PLP)</Label>
            <Textarea
              id="plp_overall_recommendation"
              name="plp_overall_recommendation"
              rows={3}
              value={formData.plp_overall_recommendation}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="plp_teacher_notes">Öğretmen Notları (PLP)</Label>
            <Textarea
              id="plp_teacher_notes"
              name="plp_teacher_notes"
              rows={4}
              value={formData.plp_teacher_notes}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 mb-5 text-end">
        <Button type="submit" className="mr-2">
          Kaydet
        </Button>
        <Button type="button" variant="secondary">
          İptal
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
