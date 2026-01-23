import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/event.dart';
import '../models/user.dart';
import '../blocs/wishlist_bloc.dart';
import '../blocs/wishlist_event.dart';

class EventsListView extends StatelessWidget {
  final List<Event> events;
  final User user;

  const EventsListView({super.key, required this.events, required this.user});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Мои события',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                  ),
                  Text(
                    'Все твои заветные желания',
                    style: TextStyle(fontSize: 14, color: Colors.slate.shade500, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () {},
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [Color(0xffa855f7), Color(0xfff43f5e)]),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: Color(0x33f43f5e), blurRadius: 10, offset: Offset(0, 4))
                    ],
                  ),
                  child: const Icon(LucideIcons.plus, color: Colors.white, size: 28),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            itemCount: events.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final event = events[index];
              return _buildEventCard(context, event);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEventCard(BuildContext context, Event event) {
    return GestureDetector(
      onTap: () => context.read<WishlistBloc>().add(SelectEvent(event.id)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 20, offset: const Offset(0, 10))
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xffa855f7), Color(0xfff43f5e)]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(LucideIcons.calendar, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xff1e293b)),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        event.date ?? 'Скоро',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff94a3b8)),
                      ),
                      const SizedBox(width: 8),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xffe2e8f0), shape: BoxShape.circle)),
                      const SizedBox(width: 8),
                      const Text(
                        'ACTIVE',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xffa855f7)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(LucideIcons.chevronRight, color: Color(0xffcbd5e1), size: 20),
          ],
        ),
      ),
    );
  }
}
