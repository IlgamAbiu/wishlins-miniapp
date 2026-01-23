import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/wish.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/wishlist_bloc.dart';
import '../blocs/wishlist_event.dart';
import 'wish_dialog.dart';

class WishCardWidget extends StatelessWidget {
  final Wish wish;
  final bool isOwner;
  final int currentUserId;

  const WishCardWidget({super.key, required this.wish, required this.isOwner, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    final statusColor = wish.isBooked ? const Color(0xff9333ea) : const Color(0xffa855f7);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image Area
          Expanded(
            child: Stack(
              children: [
                if (wish.imageUrl != null && wish.imageUrl!.isNotEmpty)
                  CachedNetworkImage(
                    imageUrl: wish.imageUrl!,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    placeholder: (context, url) => Container(color: const Color(0xfff8fafc)),
                    errorWidget: (context, url, error) => Container(
                      color: const Color(0xfff1f5f9),
                      child: const Center(child: Icon(LucideIcons.image, color: Color(0xff94a3b8))),
                    ),
                  )
                else
                  Container(
                    color: const Color(0xfff1f5f9),
                    child: const Center(child: Icon(LucideIcons.gift, color: Color(0xff94a3b8), size: 40)),
                  ),
                // Reserved Badge
                if (wish.isBooked)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xff9333ea).withOpacity(0.9),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          const Text('RESERVED', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  wish.title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xff1e293b), height: 1.2),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      wish.price != null ? '${wish.price!.toInt()} ${wish.currency == 'RUB' ? '₽' : wish.currency}' : 'Цена...',
                      style: TextStyle(fontWeight: FontWeight.w900, color: statusColor, fontSize: 16),
                    ),
                    if (wish.url != null && wish.url!.isNotEmpty)
                      const Icon(LucideIcons.externalLink, color: Color(0xff3b82f6), size: 16),
                  ],
                ),
                const SizedBox(height: 12),
                if (!isOwner)
                  _buildActionButton(context)
                else
                  _buildEditActions(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context) {
    if (wish.isBooked && wish.bookedByUserId != currentUserId) {
       return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(color: const Color(0xfff8fafc), borderRadius: BorderRadius.circular(16)),
        child: const Center(
          child: Text('Already Taken', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold, fontSize: 11)),
        ),
      );
    }

    return GestureDetector(
      onTap: () {
        context.read<WishlistBloc>().add(ToggleWishBooking(
          wishId: wish.id,
          isBooked: !wish.isBooked,
        ));
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          gradient: wish.isBooked 
              ? null 
              : const LinearGradient(colors: [Color(0xffa855f7), Color(0xfff43f5e)]),
          color: wish.isBooked ? const Color(0xfff1f5f9) : null,
          borderRadius: BorderRadius.circular(16),
          boxShadow: wish.isBooked ? null : [
            BoxShadow(color: const Color(0xfff43f5e).withOpacity(0.15), blurRadius: 10, offset: const Offset(0, 4))
          ],
        ),
        child: Center(
          child: Text(
            wish.isBooked ? 'Unreserve' : 'Reserve This Gift',
            style: TextStyle(
              color: wish.isBooked ? const Color(0xff64748b) : Colors.white, 
              fontWeight: FontWeight.bold, 
              fontSize: 11, 
              letterSpacing: 0.5
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEditActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              showDialog(
                context: context,
                builder: (dialogContext) => WishDialog(
                  initialData: {
                    'title': wish.title,
                    'price': wish.price,
                    'url': wish.url,
                    'image_url': wish.imageUrl,
                    'comment': wish.comment,
                  },
                  onSave: (data) {
                    context.read<WishlistBloc>().add(UpdateWishRequested(
                      wishId: wish.id,
                      wishData: data,
                    ));
                  },
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(color: const Color(0xfff8fafc), borderRadius: BorderRadius.circular(12)),
              child: const Center(
                child: Text('EDIT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xff64748b))),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () {
            context.read<WishlistBloc>().add(DeleteWishRequested(wish.id));
          },
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: const Color(0xfffef2f2), borderRadius: BorderRadius.circular(12)),
            child: const Icon(LucideIcons.trash2, color: Color(0xfff87171), size: 16),
          ),
        ),
      ],
    );
  }
}

