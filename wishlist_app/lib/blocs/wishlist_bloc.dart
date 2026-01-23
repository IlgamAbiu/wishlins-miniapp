import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telegram_web_app/telegram_web_app.dart';
import '../repositories/wishlist_repository.dart';
import '../models/user.dart' as model;
import 'wishlist_event.dart';
import 'wishlist_state.dart';

class WishlistBloc extends Bloc<WishlistEvent, WishlistState> {
  final WishlistRepository repository;
  model.User? _currentUser;

  WishlistBloc({required this.repository}) : super(WishlistInitial()) {
    on<AppStarted>(_onAppStarted);
    on<LoadMyEvents>(_onLoadMyEvents);
    on<SelectEvent>(_onSelectEvent);
    on<BackToList>(_onBackToList);
    on<CreateEventRequested>(_onCreateEvent);
    on<AddWishRequested>(_onAddWish);
    on<UpdateWishRequested>(_onUpdateWish);
    on<DeleteWishRequested>(_onDeleteWish);
    on<ToggleWishBooking>(_onToggleWishBooking);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<WishlistState> emit) async {
    emit(WishlistLoading());
    
    _currentUser = model.User(id: 123, firstName: 'Dev (Browser)');
    
    try {
      final webApp = TelegramWebApp.instance;
      if (webApp.isSupported) {
        final user = webApp.initDataUnsafe?.user;
        if (user != null) {
          _currentUser = model.User(
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
          );
        }
      }
    } catch (e) {
      print('TelegramWebApp not available: $e');
    }

    try {
      await repository.syncUser(_currentUser!);
      add(LoadMyEvents(_currentUser!.id));
    } catch (e) {
      emit(WishlistError('Connection error: $e'));
    }
  }

  Future<void> _onLoadMyEvents(LoadMyEvents event, Emitter<WishlistState> emit) async {
    try {
      final events = await repository.getMyEvents(event.userId);
      emit(MyEventsLoaded(user: _currentUser!, events: events));
    } catch (e) {
      emit(WishlistError('Failed to load events: $e'));
    }
  }

  Future<void> _onSelectEvent(SelectEvent event, Emitter<WishlistState> emit) async {
    emit(WishlistLoading());
    try {
      final eventData = await repository.getEvent(event.eventId);
      final wishes = await repository.getWishes(event.eventId);
      emit(EventDetailLoaded(user: _currentUser!, event: eventData, wishes: wishes));
    } catch (e) {
      emit(WishlistError('Failed to load event details: $e'));
    }
  }

  Future<void> _onCreateEvent(CreateEventRequested event, Emitter<WishlistState> emit) async {
    try {
      await repository.createEvent(_currentUser!.id, event.title, event.date, event.description);
      add(LoadMyEvents(_currentUser!.id));
    } catch (e) {
      emit(WishlistError('Failed to create event: $e'));
    }
  }

  Future<void> _onAddWish(AddWishRequested event, Emitter<WishlistState> emit) async {
    try {
      await repository.createWish({
        ...event.wishData,
        'eventId': event.eventId,
      });
      add(SelectEvent(event.eventId));
    } catch (e) {
      emit(WishlistError('Failed to add wish: $e'));
    }
  }

  Future<void> _onUpdateWish(UpdateWishRequested event, Emitter<WishlistState> emit) async {
    try {
      await repository.updateWish(event.wishId, event.wishData);
      if (state is EventDetailLoaded) {
        add(SelectEvent((state as EventDetailLoaded).event.id));
      }
    } catch (e) {
      emit(WishlistError('Failed to update wish: $e'));
    }
  }

  Future<void> _onDeleteWish(DeleteWishRequested event, Emitter<WishlistState> emit) async {
    try {
      final eventId = (state as EventDetailLoaded).event.id;
      await repository.deleteWish(event.wishId);
      add(SelectEvent(eventId));
    } catch (e) {
      emit(WishlistError('Failed to delete wish: $e'));
    }
  }

  Future<void> _onToggleWishBooking(ToggleWishBooking event, Emitter<WishlistState> emit) async {
    try {
      final eventId = (state as EventDetailLoaded).event.id;
      await repository.updateWish(event.wishId, {
        'isBooked': event.isBooked,
        'bookedByUserId': event.isBooked ? _currentUser!.id : null,
      });
      add(SelectEvent(eventId));
    } catch (e) {
      emit(WishlistError('Failed to toggle booking: $e'));
    }
  }

  void _onBackToList(BackToList event, Emitter<WishlistState> emit) {
    if (_currentUser != null) {
      add(LoadMyEvents(_currentUser!.id));
    }
  }
}

