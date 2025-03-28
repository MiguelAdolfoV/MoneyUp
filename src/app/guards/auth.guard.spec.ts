import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routerMock = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('debería permitir el acceso si el usuario está logueado', async () => {
    authServiceSpy.isLoggedIn.and.resolveTo(true);

    const result = await guard.canActivate();
    expect(result).toBeTrue();
  });

  it('debería redirigir a /login si el usuario NO está logueado', async () => {
    authServiceSpy.isLoggedIn.and.resolveTo(false);
    routerSpy.parseUrl.and.returnValue(routerSpy.parseUrl('/login'));

    const result = await guard.canActivate();
    expect(result).toBe(routerSpy.parseUrl('/login'));
  });
});
