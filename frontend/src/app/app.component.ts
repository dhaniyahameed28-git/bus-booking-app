import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
  <div style="font-family:Arial; max-width:900px; margin:auto; padding:20px">
    <h1 style="color:#d32f2f; text-align:center">🚌 Intercity Bus Booking</h1>
    <p style="text-align:center">Cochin ↔ Calicut | 6 Operators</p>
    <div style="background:#fff3e0; padding:15px; border-radius:10px; display:flex; gap:10px; flex-wrap:wrap">
      <select [(ngModel)]="from" style="padding:12px; flex:1"><option>Cochin</option><option>Calicut</option></select>
      <select [(ngModel)]="to" style="padding:12px; flex:1"><option>Calicut</option><option>Cochin</option></select>
      <input type="date" [(ngModel)]="journeyDate" [min]="minDate" style="padding:12px; flex:1">
      <button (click)="search()" style="padding:12px 20px; background:#d32f2f; color:white; border:none; border-radius:6px">Search Buses</button>
    </div>
    <p *ngIf="errorMsg" style="color:red; text-align:center">{{errorMsg}}</p>
    <div *ngFor="let bus of filtered" style="border:1px solid #ddd; padding:15px; margin:12px 0; border-radius:10px; display:flex; justify-content:space-between">
      <div>
        <h3 style="margin:0">{{bus.operator}} - {{bus.name}}</h3>
        <p style="margin:5px 0">{{bus.departure}} - {{bus.arrival}} ({{bus.duration}}) | {{bus.from}}→{{bus.to}} | ₹{{bus.price}} | Seats:{{bus.available}}</p>
      </div>
      <button (click)="selectBus(bus)" style="background:#2e7d32; color:white; padding:10px 18px; border:none; border-radius:6px">Book Now</button>
    </div>
    <div *ngIf="selectedBus" style="border:2px solid #d32f2f; padding:20px; border-radius:12px; margin-top:20px">
      <h2>Booking: {{selectedBus.operator}} - {{selectedBus.name}}</h2>
      <p>Date: {{journeyDate}} | {{selectedBus.from}} → {{selectedBus.to}}</p>
      <input [(ngModel)]="name" placeholder="Passenger Name" style="padding:10px; width:95%; margin:6px 0"><br>
      <input [(ngModel)]="phone" placeholder="Phone Number" style="padding:10px; width:95%; margin:6px 0"><br>
      <label>Passengers: </label><input type="number" [(ngModel)]="seats" min="1" max="6" style="padding:10px; width:80px">
      <h3>Total: ₹{{selectedBus.price * seats}}</h3>
      <button (click)="book()" style="background:#d32f2f; color:white; padding:12px; width:100%; border:none; border-radius:8px">Confirm Booking</button>
      <p *ngIf="bookingSuccess" style="color:green; font-weight:bold">✅ {{bookingSuccess.message}} - Ref: {{bookingSuccess.booking.id}} - Paid: ₹{{bookingSuccess.booking.total}}</p>
    </div>
  </div>`
})
export class AppComponent {
  buses:any[]=[]; filtered:any[]=[]; from='Cochin'; to='Calicut'; journeyDate=''; name=''; phone=''; seats=1; selectedBus:any=null; bookingSuccess:any=null; errorMsg=''; minDate=new Date().toISOString().split('T')[0];
  constructor(private http:HttpClient){ this.journeyDate=this.minDate; this.http.get<any[]>('http://localhost:5000/api/buses').subscribe(d=>{this.buses=d; this.filtered=d;}); }
  search(){
    this.errorMsg='';
    if(this.from===this.to){ this.errorMsg='From and To cannot be same'; return; }
    this.http.get<any[]>(`http://localhost:5000/api/buses?from=${this.from}&to=${this.to}`).subscribe(d=>{this.filtered=d; if(d.length===0) this.errorMsg='No buses available for selected route';});
  }
  selectBus(b:any){ this.selectedBus=b; this.bookingSuccess=null; }
  book(){ this.http.post('http://localhost:5000/api/book',{busId:this.selectedBus.id, name:this.name, phone:this.phone, seatsCount:this.seats}).subscribe((res:any)=>{this.bookingSuccess=res;}); }
}