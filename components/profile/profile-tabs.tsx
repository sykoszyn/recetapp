'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProfileTabs({
  recipesPanel,
  resultsPanel,
  savedPanel,
}: {
  recipesPanel: React.ReactNode;
  resultsPanel: React.ReactNode;
  savedPanel?: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="recipes" className="mt-6">
      <TabsList>
        <TabsTrigger value="recipes">Recetas</TabsTrigger>
        <TabsTrigger value="results">Resultados</TabsTrigger>
        {savedPanel && <TabsTrigger value="saved">Guardados</TabsTrigger>}
      </TabsList>
      <TabsContent value="recipes">{recipesPanel}</TabsContent>
      <TabsContent value="results">{resultsPanel}</TabsContent>
      {savedPanel && <TabsContent value="saved">{savedPanel}</TabsContent>}
    </Tabs>
  );
}
