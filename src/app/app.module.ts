import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { FriendGameComponent } from './components/friend-game/friend-game.component';
import { AIGameComponent } from './components/ai-game/ai-game.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: HomepageComponent,
  },
  {
    path: 'friend-game',
    component: FriendGameComponent,
  },
  {
    path: 'AI-game',
    component: AIGameComponent,
  }
]

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    FriendGameComponent,
    AIGameComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
