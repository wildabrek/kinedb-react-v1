"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createGame } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function CreateGamePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [game, setGame] = useState({
    game_name: "",
    subject: "",
    level: "",
    difficulty_level: "easy",
    description: "",
    time_limit: 0,
    points_per_question: 0,
    status: "active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGame((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setGame((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        game_id: 0, // Eklenen satır ✅
        game_name: game.game_name,
        subject: game.subject,
        level: game.level,
        difficulty_level: game.difficulty_level === "easy" ? 1 : game.difficulty_level === "medium" ? 2 : 3,
        description: game.description,
        time_limit: Number(game.time_limit),
        points_per_question: Number(game.points_per_question),
        status: game.status,
        creator: "admin",
        plays: 0,
        avg_score: 0,
        avg_time: "0 min",
      };

      await createGame(payload);

      toast({
        title: "Game Created",
        description: `${game.game_name} has been created successfully.`,
      });

      router.push("/games");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create game.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Game</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Game Name</Label>
            <Input name="game_name" value={game.game_name} onChange={handleInputChange} />
          </div>
          <div>
            <Label>Subject</Label>
            <Input name="subject" value={game.subject} onChange={handleInputChange} />
          </div>
          <div>
            <Label>Level</Label>
            <Input name="level" value={game.level} onChange={handleInputChange} />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={game.difficulty_level} onValueChange={(v) => handleSelectChange("difficulty_level", v)}>
              <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time Limit (minutes)</Label>
            <Input name="time_limit" type="number" value={game.time_limit} onChange={handleInputChange} />
          </div>
          <div>
            <Label>Points per Question</Label>
            <Input name="points_per_question" type="number" value={game.points_per_question} onChange={handleInputChange} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea name="description" value={game.description} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Game
        </Button>
      </div>
    </form>
  );
}
