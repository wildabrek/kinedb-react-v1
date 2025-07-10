// components/student-detail.tsx
"use client";

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft } from 'lucide-react'

interface StudentDetailProps {
  student: any;
  onEdit: (studentId: number) => void;
  onDelete: (studentId: number) => void;
  onBack: () => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onEdit, onDelete, onBack }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <UserCircle className="me-2" />
          {student.name}
          <small className="text-muted fw-normal align-middle ms-2" style={{ fontSize: '0.8em' }}>
            (#{student.student_external_id || student.student_internal_id}) - {student.class_name || 'Sınıfsız'}
          </small>
        </h1>
        <div className="action-buttons">
          <Button variant="warning" size="sm" onClick={() => onEdit(student.student_internal_id)}>
            <Edit className="h-4 w-4" /> Düzenle
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(student.student_internal_id)}>
            <Trash2 className="h-4 w-4" /> Sil
          </Button>
          <Button variant="secondary" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Listeye Dön
          </Button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <Card className="shadow-sm mb-4">
            <div className="d-flex justify-content-center p-3 bg-light border-bottom">
              <Avatar className="h-32 w-32">
                <AvatarImage src={student.avatar || "/placeholder.svg?height=128&width=128"} alt={student.name} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardContent className="pt-2 text-center">
              <h5 className="card-title mb-1 mt-2">{student.name}</h5>
              <p className="card-text text-muted small mb-3">{student.email || 'E-posta Yok'}</p>
              <hr className="my-2" />
              <div className="row text-start small g-2 mt-3">
                <div className="col-5 text-muted">
                  <BookOpen className="me-1" />
                  Sınıf:
                </div>
                <div className="col-7 fw-medium">{student.class_name || 'N/A'}</div>
                <div className="col-5 text-muted">
                  <Info className="me-1" />
                  Durum:
                </div>
                <div className="col-7">
                  <Badge variant={student.status === 'Active' ? 'success' : 'secondary'}>
                    {student.status || 'N/A'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-md-8">
          <Card className="shadow-sm mb-4">
            <CardHeader>
              <CardTitle>Performans Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ortalama Puan: {student.avg_score || 'N/A'}</p>
              <p>İlerleme Durumu: {student.progress_status || 'N/A'}</p>
              <p>Oynanan Oyun Sayısı: {student.games_played || 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
