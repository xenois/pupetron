import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', redirectTo: 'pages' },  // Wildcard route for a 404 page];
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
