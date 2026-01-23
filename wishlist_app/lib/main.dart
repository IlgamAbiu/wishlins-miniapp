import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telegram_web_app/telegram_web_app.dart';
import 'blocs/wishlist_bloc.dart';
import 'blocs/wishlist_event.dart';
import 'blocs/wishlist_state.dart';
import 'repositories/wishlist_repository.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    if (TelegramWebApp.instance.isSupported) {
      TelegramWebApp.instance.ready();
      TelegramWebApp.instance.expand();
    }
  } catch (_) {}

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (context) => WishlistRepository(),
      child: BlocProvider(
        create: (context) => WishlistBloc(
          repository: RepositoryProvider.of<WishlistRepository>(context),
        )..add(AppStarted()),
        child: MaterialApp(
          title: 'Wishlist Mini App',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            useMaterial3: true,
            colorSchemeSeed: const Color(0xffa855f7),
            fontFamily: 'Inter',
          ),
          home: const HomeScreen(),
        ),
      ),
    );
  }
}
