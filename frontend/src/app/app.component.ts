
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';

interface Bus {
  id: string;
  name: string;
  from: string;
  to: string;
  fare: number;
  time: string;
}

interface Booking {
  reference: string;
  passengerName: string;
  contact: string;
  busId: string;
  busName: string;
  from: string;
  to: string;
  journeyDate: string;
  passengers: number;
  totalFare: number;
}

interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
private readonly apiUrl = 'http://13.53.138.152:3000/api';

  fromCity = 'Kozhikode';
  toCity = 'Kannur';

  today = this.getTodayDate();
  journeyDate = this.today;

  buses: Bus[] = [];
  selectedBus: Bus | null = null;
  bookingResult: Booking | null = null;

  passengerName = '';
  phone = '';
  passengers = 1;

  searched = false;
  loading = false;
  bookingLoading = false;

  errorMessage = '';
  bookingError = '';

  constructor(private http: HttpClient) {}

  private getTodayDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Search buses using the backend API
  searchBuses(): void {
    if (this.fromCity === this.toCity) {
      this.errorMessage = 'Departure and destination must be different.';
      return;
    }

    if (this.journeyDate < this.today) {
      this.errorMessage = 'Please select today or a future date.';
      return;
    }

    this.loading = true;
    this.searched = true;
    this.errorMessage = '';
    this.buses = [];
    this.selectedBus = null;
    this.bookingResult = null;

    const params = new HttpParams()
      .set('from', this.fromCity)
      .set('to', this.toCity);

    this.http.get<Bus[]>(`${this.apiUrl}/buses`, { params })
      .subscribe({
        next: (response) => {
          this.buses = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Bus search error:', error);

          this.errorMessage =
            'Unable to load buses. Please check that the backend is running.';

          this.loading = false;
        }
      });
  }

  // Select a bus and show passenger form
  bookBus(bus: Bus): void {
    this.selectedBus = bus;
    this.bookingResult = null;
    this.bookingError = '';

    this.passengerName = '';
    this.phone = '';
    this.passengers = 1;
  }

  // Create a booking in MongoDB
  confirmBooking(): void {
    if (!this.selectedBus) {
      this.bookingError = 'Please select a bus first.';
      return;
    }

    if (
      !this.passengerName.trim() ||
      this.passengerName.trim().length < 2
    ) {
      this.bookingError = 'Please enter a valid passenger name.';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.phone)) {
      this.bookingError = 'Enter a valid 10-digit phone number.';
      return;
    }

    if (
      !Number.isInteger(this.passengers) ||
      this.passengers < 1 ||
      this.passengers > 6
    ) {
      this.bookingError = 'Choose between 1 and 6 passengers.';
      return;
    }

    if (this.journeyDate < this.today) {
      this.bookingError = 'Please select a valid journey date.';
      return;
    }

    this.bookingLoading = true;
    this.bookingError = '';

    // These field names must match server.js
    const payload = {
      passengerName: this.passengerName.trim(),
      contact: this.phone,
      busId: this.selectedBus.id,
      journeyDate: this.journeyDate,
      passengers: Number(this.passengers)
    };

    this.http.post<BookingResponse>(
      `${this.apiUrl}/bookings`,
      payload
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bookingResult = response.data;
        } else {
          this.bookingError = 'The booking could not be completed.';
        }

        this.bookingLoading = false;
      },
      error: (error) => {
        console.error('Booking error:', error);

        this.bookingError =
          error.error?.message ||
          'Booking failed. Please try again.';

        this.bookingLoading = false;
      }
    });
  }

  // Cancel the current booking form
  cancelBooking(): void {
    this.selectedBus = null;
    this.bookingResult = null;
    this.bookingError = '';
  }

  // Return to the bus list after a successful booking
  finishBooking(): void {
    this.selectedBus = null;
    this.bookingResult = null;

    this.passengerName = '';
    this.phone = '';
    this.passengers = 1;
    this.bookingError = '';
  }
}
