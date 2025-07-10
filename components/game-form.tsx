// components/game-form.tsx
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
import { PlusCircle, Joystick } from 'lucide-react'

interface GameFormProps {
  game?: any;
  allSubjects: string[];
  allSkills: string[];
  possibleStrengths: { id: string; label: string; description: string }[];
  possibleAreas: { id: string; label: string; description: string }[];
  allGamesForReco: string[];
  gameImpacts?: any;
  onSubmit: (data: any) => void;
}

const GameForm: React.FC<GameFormProps> = ({
  game,
  allSubjects,
  allSkills,
  possibleStrengths,
  possibleAreas,
  allGamesForReco,
  gameImpacts,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    game_name: game?.game_name || '',
    level: game?.level || '',
    genre: game?.genre || '',
    main_subject: gameImpacts?.main_subject || '',
    description: game?.description || '',
    subjects_boost_keys: gameImpacts?.subjects_boost ? Object.keys(gameImpacts.subjects_boost) : [],
    subjects_boost_values: gameImpacts?.subjects_boost ? Object.values(gameImpacts.subjects_boost) : [],
    skills_boost_keys: gameImpacts?.skills_boost ? Object.keys(gameImpacts.skills_boost) : [],
    skills_boost_values: gameImpacts?.skills_boost ? Object.values(gameImpacts.skills_boost) : [],
    add_strengths: gameImpacts?.add_strengths || [],
    add_areas: gameImpacts?.add_areas_on_low_score || [],
    recommendations: gameImpacts?.recommendations || [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const currentValue = formData[name] || [];
    const newValue = checked
      ? [...currentValue, value]
      : currentValue.filter((item: string) => item !== value);
    setFormData({ ...formData, [name]: newValue });
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
          <CardTitle>
            <Joystick className="me-1" />
            Temel Oyun Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="game_name">Oyun Adı *</Label>
              <Input
                type="text"
                id="game_name"
                name="game_name"
                value={formData.game_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="level">Seviye</Label>
              <Input
                type="text"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="genre">Tür</Label>
              <Input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="main_subject">Ana Ders (Aylık İlerleme İçin)</Label>
              <Select
                value={formData.main_subject}
                onValueChange={(value) => handleSelectChange("main_subject", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Yok --" />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.map((subjectName) => (
                    <SelectItem key={subjectName} value={subjectName}>
                      {subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="form-text small">
                Bu oyunun puanı hangi dersin aylık ilerlemesini güncellesin?
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 shadow-sm">
        <CardHeader>
          <CardTitle>
            <BarChart3 className="me-1" />
            Oyun Etkileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h6 className="text-sm font-medium">Eklenecek Güçlü Yönler</h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {possibleStrengths.map((strength) => (
                <div key={strength.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`strength_${strength.id}`}
                    name="add_strengths"
                    value={strength.id}
                    checked={formData.add_strengths.includes(strength.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange({
                        target: { name: "add_strengths", value: strength.id, checked },
                      } as any)
                    }
                  />
                  <Label htmlFor={`strength_${strength.id}`} className="text-sm">
                    {strength.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h6 className="text-sm font-medium">Eklenecek Gelişim Alanları</h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {possibleAreas.map((area) => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area_${area.id}`}
                    name="add_areas"
                    value={area.id}
                    checked={formData.add_areas.includes(area.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange({
                        target: { name: "add_areas", value: area.id, checked },
                      } as any)
                    }
                  />
                  <Label htmlFor={`area_${area.id}`} className="text-sm">
                    {area.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h6 className="text-sm font-medium">Önerilecek Oyunlar</h6>
            <Select
              multiple
              value={formData.recommendations}
              onValueChange={(value) => setFormData({ ...formData, recommendations: value as string[] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recommended games" />
              </SelectTrigger>
              <SelectContent>
                {allGamesForReco.map((gameName) => (
                  <SelectItem key={gameName} value={gameName}>
                    {gameName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default GameForm;
