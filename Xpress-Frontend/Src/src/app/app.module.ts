import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop'; 

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    DragDropModule,  // Add it here
    // other modules
  ],
  providers: [],
})
export class AppModule { }
