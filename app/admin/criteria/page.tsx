'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText, GripVertical } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';

interface Criterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
  order: number;
  active: boolean;
  type: string[];
}

const CRITERIA_TYPE_OPTIONS = [
  { label: 'Qualification', value: 'qualification' },
  { label: 'Finals', value: 'finals' },
];

export default function CriteriaPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(
    null
  );
  const [deleteCriterion, setDeleteCriterion] = useState<Criterion | null>(
    null
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxPoints: 20,
    weight: 1,
    type: [] as string[],
  });

  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const response = await fetch('/api/data/criteria');
        const data = await response.json();
        console.log('data', data);
        setCriteria(
          data.criteria.sort((a: Criterion, b: Criterion) => a.order - b.order)
        );
      } catch (error) {
        console.error('[v0] Error loading criteria:', error);
      }
    };

    loadCriteria();
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newCriteria = [...criteria];
    const draggedItem = newCriteria[draggedIndex];

    // Remove dragged item and insert at new position
    newCriteria.splice(draggedIndex, 1);
    newCriteria.splice(dropIndex, 0, draggedItem);

    // Update order values
    const reorderedCriteria = newCriteria.map((criterion, index) => ({
      ...criterion,
      order: index + 1,
    }));

    setCriteria(reorderedCriteria);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save new order to server
    try {
      await fetch('/api/admin/criteria/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: reorderedCriteria }),
      });
    } catch (error) {
      console.error('[v0] Error saving criterion order:', error);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenDialog = (criterion?: Criterion) => {
    if (criterion) {
      setEditingCriterion(criterion);
      setFormData({
        name: criterion.name,
        description: criterion.description,
        maxPoints: criterion.maxPoints,
        weight: criterion.weight,
        type: criterion.type,
      });
    } else {
      setEditingCriterion(null);
      setFormData({
        name: '',
        description: '',
        maxPoints: 20,
        weight: 1,
        type: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/admin/criteria';
      const method = editingCriterion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingCriterion ? { id: editingCriterion.id, ...formData } : formData
        ),
      });

      if (response.ok) {
        const { criterion } = await response.json();

        if (editingCriterion) {
          setCriteria(
            criteria.map((c) =>
              c.id === editingCriterion.id ? { ...c, ...formData } : c
            )
          );
        } else {
          setCriteria([...criteria, criterion]);
        }

        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('[v0] Error saving criterion:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteCriterion) return;

    try {
      const response = await fetch(
        `/api/admin/criteria?id=${deleteCriterion.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setCriteria(criteria.filter((c) => c.id !== deleteCriterion.id));
        setDeleteCriterion(null);
      }
    } catch (error) {
      console.error('[v0] Error deleting criterion:', error);
    }
  };

  const handleToggleActive = async (criterionId: string) => {
    const criterion = criteria.find((c) => c.id === criterionId);
    if (!criterion) return;

    try {
      const response = await fetch('/api/admin/criteria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: criterionId,
          active: !criterion.active,
        }),
      });

      if (response.ok) {
        setCriteria(
          criteria.map((c) =>
            c.id === criterionId ? { ...c, active: !criterion.active } : c
          )
        );
      }
    } catch (error) {
      console.error('[v0] Error toggling criterion:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Criteria Management</h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4" />
              Add Criterion
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingCriterion ? 'Edit Criterion' : 'Add New Criterion'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingCriterion
                  ? 'Update criterion details'
                  : 'Add a new judging criterion'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Criterion Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Creativity"
                  className="bg-slate-950/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g., Originality and innovative design elements"
                  className="bg-slate-950/50 border-slate-700 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPoints">Max Score</Label>
                <Input
                  id="maxPoints"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.maxPoints}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPoints: Number(e.target.value),
                    })
                  }
                  className="bg-slate-950/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Criteria Type</Label>
                <MultiSelect
                  options={CRITERIA_TYPE_OPTIONS}
                  selected={formData.type}
                  onChange={(selected) =>
                    setFormData({ ...formData, type: selected || [] })
                  }
                  placeholder="Select criteria types..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {editingCriterion ? 'Update Criterion' : 'Add Criterion'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900/50 border-purple-500/20 animate-slide-up hover-lift">
        <CardHeader>
          <CardTitle className="text-white">Judging Criteria</CardTitle>
          <CardDescription className="text-slate-400">
            Drag criteria by the grip icon to reorder. Criteria appear as score
            columns for each judge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criteria.map((criterion, index) => (
              <div
                key={criterion.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border transition-all duration-300 animate-slide-up ${
                  draggedIndex === index
                    ? 'opacity-50 border-purple-500'
                    : dragOverIndex === index
                    ? 'border-cyan-500 bg-cyan-500/5 scale-105'
                    : 'border-slate-700/50 hover:border-purple-500/30 hover:translate-x-2'
                }`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="cursor-move active:cursor-grabbing">
                    <GripVertical className="w-5 h-5 text-slate-500 hover:text-purple-400 transition-colors" />
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {criterion.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        Max: {criterion.maxPoints}
                      </Badge>
                      {criterion.type && criterion.type.length > 0 && (
                        <>
                          {criterion.type.includes('qualification') && (
                            <Badge
                              variant="outline"
                              className="border-blue-500/50 text-blue-400"
                            >
                              Qualification
                            </Badge>
                          )}
                          {criterion.type.includes('finals') && (
                            <Badge
                              variant="outline"
                              className="border-green-500/50 text-green-400"
                            >
                              Finals
                            </Badge>
                          )}
                        </>
                      )}
                      {!criterion.active && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-700 text-slate-400"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {criterion.description && (
                      <p className="text-sm text-slate-400 mt-1">
                        {criterion.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(criterion.id)}
                    className={`gap-2 border-slate-700 ${
                      criterion.active ? 'text-slate-400' : 'text-green-400'
                    }`}
                  >
                    {criterion.active ? 'Deactivate' : 'Activate'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(criterion)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteCriterion(criterion)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteCriterion}
        onOpenChange={(open) => !open && setDeleteCriterion(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Criterion</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete{' '}
              <strong>{deleteCriterion?.name}</strong>? This action cannot be
              undone. If scores already exist using this criterion, they will be
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Criterion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
