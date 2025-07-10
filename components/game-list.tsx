// components/game-list.tsx
"use client";

import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Gamepad2 } from 'lucide-react'

interface Game {
  game_id: number;
  game_name: string;
  level: string;
  genre: string;
  associated_strengths: string[];
  description: string;
}

interface GamesListProps {
  games: Game[];
  onEdit: (gameId: number) => void;
  onDelete: (gameId: number) => void;
}

const GameList: React.FC<GamesListProps> = ({ games, onEdit, onDelete }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <Gamepad2 className="me-2" />
          Oyunlar
        </h1>
        <Button variant="success">
          <Link href="/games/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Oyun Ekle
          </Link>
        </Button>
      </div>

      {games.length > 0 ? (
        <div className="table-responsive">
          <Table className="table table-striped table-hover">
            <TableHeader>
              <TableRow>
                <TableHead>Oyun Adı</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Etkilediği Güçlü Yönler</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-end">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.game_id}>
                  <TableCell>{game.game_name}</TableCell>
                  <TableCell>{game.level || '-'}</TableCell>
                  <TableCell>{game.genre || '-'}</TableCell>
                  <TableCell className="strength-list small">
                    {game.associated_strengths && game.associated_strengths.length > 0 ? (
                      game.associated_strengths.map((strength_label) => (
                        <span key={strength_label} className="badge bg-success">
                          {strength_label}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell>{game.description?.substring(0, 80) || '-'}</TableCell>
                  <TableCell className="action-buttons text-end">
                    <Button variant="warning" size="sm" onClick={() => onEdit(game.game_id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(game.game_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted">Gösterilecek oyun bulunamadı.</p>
      )}
    </div>
  );
};

export default GameList;
