import { TestBed } from '@angular/core/testing';
import { NoAuthGuard } from './no-auth.guard';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NoAuthGuard,
        {
          provide: Router,
          useValue: { parseUrl: jasmine.createSpy('parseUrl') }
        },
        {
          provide: ToastController,
          useValue: {
            create: () => Promise.resolve({
              present: () => Promise.resolve()
            })
          }
        },
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => Promise.resolve(false)
          }
        }
      ]
    });

    guard = TestBed.inject(NoAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
