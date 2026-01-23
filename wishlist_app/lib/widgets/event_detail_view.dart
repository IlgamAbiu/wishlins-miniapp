import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/event.dart';
import '../models/wish.dart';
import '../models/user.dart';
import '../blocs/wishlist_bloc.dart';
import '../blocs/wishlist_event.dart';
import 'wish_card_widget.dart';
import 'wish_dialog.dart';

class EventDetailView extends StatelessWidget {
  final Event event;
  final List<Wish> wishes;
  final User user;

  const EventDetailView({super.key, required this.event, required this.wishes, required this.user});

  @override
  Widget build(BuildContext context) {
    final isOwner = event.userId == user.id;

    return CustomScrollView(
      slivers: [
        // Premium Hero Header
        SliverToBoxAdapter(
          child: Stack(
            children: [
              Container(
                height: 320,
                width: double.infinity,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xff0ea5e9), Color(0xffa855f7)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
              // Back Button
              Positioned(
                top: 50,
                left: 20,
                child: IconButton(
                  onPressed: () => context.read<WishlistBloc>().add(BackToList()),
                  icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                  style: IconButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.2)),
                ),
              ),
              // Share Button
              Positioned(
                top: 50,
                right: 20,
                child: IconButton(
                  onPressed: () {
                    final shareUrl = 'https://t.me/share/url?url=https://wishlist.splittrip.ru/%23/event/${event.id}&text=Посмотри мой вишлист на ${event.title}! ✨';
                    // In Flutter Web we can use url_launcher or JS interop
                    // For now, let's just use Telegram JS API if available
                    try {
                      // Using Window.open or similar
                    } catch (_) {}
                  },
                  icon: const Icon(LucideIcons.share2, color: Colors.white),
                  style: IconButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.2)),
                ),
              ),
              // Content
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 40),
                      Container(
                        width: 96,
                        height: 96,
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                        child: Container(
                          decoration: BoxDecoration(color: Colors.blue.shade50, shape: BoxShape.circle),
                          child: const Center(child: Text('👤', style: TextStyle(fontSize: 48))),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        isOwner ? 'Мой Вишлист' : '${event.owner?.firstName ?? 'Друг'}\'s Wishlist',
                        style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        event.description ?? 'Помоги сделать этот день особенным! ✨',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // Floating Stats and Content
        SliverToBoxAdapter(
          child: Transform.translate(
            offset: const Offset(0, -32),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  // Stats Card
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))
                      ],
                    ),
                    child: Row(
                      children: [
                        _buildStat('Доступно', wishes.where((w) => !w.isBooked).length.toString(), Colors.blue),
                        Container(width: 1, height: 40, color: const Color(0xfff1f5f9)),
                        _buildStat('Всего', wishes.length.toString(), const Color(0xff1e293b)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Wishes Grid
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 0.7,
                    ),
                    itemCount: wishes.length + (isOwner ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (isOwner && index == wishes.length) {
                        return _buildAddButton(context);
                      }
                      return WishCardWidget(wish: wishes[index], isOwner: isOwner, currentUserId: user.id);
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xff94a3b8), letterSpacing: 1)),
        ],
      ),
    );
  }

  Widget _buildAddButton(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            showDialog(
              context: context,
              builder: (dialogContext) => WishDialog(
                onSave: (data) {
                  context.read<WishlistBloc>().add(AddWishRequested(
                    eventId: event.id,
                    wishData: data,
                  ));
                },
              ),
            );
          },
          borderRadius: BorderRadius.circular(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(color: Color(0xfff8fafc), shape: BoxShape.circle),
                child: const Icon(LucideIcons.plus, color: Color(0xff94a3b8)),
              ),
              const SizedBox(height: 12),
              const Text('ДОБАВИТЬ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xff94a3b8), letterSpacing: 1)),
            ],
          ),
        ),
      ),
    );
  }
}

