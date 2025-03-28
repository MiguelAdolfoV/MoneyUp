import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpRequest } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { NetworkInterceptor } from './network.interceptor';

describe('NetworkInterceptor', () => {
  let interceptor: NetworkInterceptor;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  beforeEach(() => {
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      providers: [
        NetworkInterceptor,
        { provide: ToastController, useValue: toastControllerSpy }
      ]
    });

    interceptor = TestBed.inject(NetworkInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should block requests when offline (POST)', (done) => {
    spyOnProperty(navigator, 'onLine').and.returnValue(false);

    const req = new HttpRequest<any>('POST', '/api/test', {});
    const next: HttpHandler = {
      handle: () => {
        throw new Error('This should not be called');
      }
    };

    interceptor.intercept(req, next).subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
        done();
      }
    });
  });
});
