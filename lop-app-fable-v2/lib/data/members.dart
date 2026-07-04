import 'package:collection/collection.dart';
import '../models/member.dart';

/// Lookout Point club roster — real members plus family/proxies who hunt.
///
/// `shares` shows the share(s) held in the undivided interest (two numbers =
/// two shares). Edit this list to add/remove people; nothing else changes.
const List<Member> kMembers = [
  Member(id: 'm01', name: 'David Ditch', phone: '985-209-7162', role: 'Member', shares: '1'),
  Member(id: 'm02', name: 'Darren Oglesby', phone: '318-355-8833', role: 'Board', shares: '2'),
  Member(id: 'm03', name: 'Lance Donald', phone: '318-355-0170', role: 'Board', shares: '3,4'),
  Member(id: 'm04', name: 'Jonathan Bruser', phone: '225-268-4683', role: 'Member', shares: '5'),
  Member(id: 'm05', name: 'Thomas Hessburg', phone: '225-505-5746', role: 'Member', shares: '6'),
  Member(id: 'm06', name: 'Chris Robinson', phone: '318-680-1934', role: 'Board', shares: '7,8'),
  Member(id: 'm07', name: 'Everett Stagg', phone: '318-235-2855', role: 'Member', shares: '9,10'),
  Member(id: 'm08', name: 'Al Gonzales', phone: '318-355-9281', role: 'Member', shares: '11'),
  Member(id: 'm09', name: 'Christina Gonzalez', phone: '318-372-6699', role: 'Hunting Rights'),
  Member(id: 'm10', name: 'Martin Gardner', phone: '318-366-7766', role: 'Member', shares: '12'),
  Member(id: 'm11', name: 'Wyatt Thompson', phone: '318-418-1264', role: 'Grandson'),
  Member(id: 'm12', name: 'Connor Hodge', phone: '318-376-5115', role: 'Member', shares: '13,14'),
  Member(id: 'm13', name: 'Vance Costello', phone: '318-737-0964', role: 'Member', shares: '15,16'),
  Member(id: 'm14', name: 'Jason Hornback', phone: '337-258-0109', role: 'Board', shares: '17'),
  Member(id: 'm15', name: 'Hayden Hornback', phone: '337-330-6831', role: 'Son'),
  Member(id: 'm16', name: 'Eric Graham', phone: '903-920-4094', role: 'Board', shares: '18'),
  Member(id: 'm17', name: 'Sollie Graham', phone: '713-548-4621', role: 'Wife'),
  Member(id: 'm18', name: 'Toby Frith', phone: '318-282-9213', role: 'Member', shares: '19'),
  Member(id: 'm19', name: 'Ricky Caples', phone: '318-348-5800', role: 'Member', shares: '20'),
  Member(id: 'm20', name: 'Hall Caples', phone: '318-789-9876', role: 'Son'),
  Member(id: 'm21', name: 'Bill Poole', phone: '318-729-4796', role: 'Member', shares: '21'),
  Member(id: 'm22', name: 'Byron Poole', phone: '318-729-1815', role: 'Proxy'),
  Member(id: 'm23', name: 'Jason Ewing', phone: '318-366-7277', role: 'Board', shares: '22'),
  Member(id: 'm24', name: 'Perry Smith', phone: '318-355-0563', role: 'Brother'),
  Member(id: 'm25', name: 'David Hampton', phone: '318-366-2328', role: 'Member', shares: '23'),
  Member(id: 'm26', name: 'Parker Templeton', phone: '337-519-9914', role: 'Member', shares: '24'),
  Member(id: 'm27', name: 'Chad Gardner', phone: '318-282-1827', role: 'Board', shares: '25'),
  Member(id: 'm28', name: 'Preston Gardner', phone: '318-669-5948', role: 'Son'),
  Member(id: 'm29', name: 'Tim Clemons', phone: '318-268-8016', role: 'Member', shares: '26'),
  Member(id: 'm30', name: 'Cade Clemons', phone: '318-401-5705', role: 'Son'),
  Member(id: 'm31', name: 'Jott Delcambre', phone: '318-791-9818', role: 'Member', shares: '27'),
  Member(id: 'm32', name: 'Owen Delcambre', phone: '318-366-4008', role: 'Son'),
  Member(id: 'm33', name: 'Kevin Hopper', phone: '318-366-7467', role: 'Member', shares: '28'),
  Member(id: 'm34', name: 'Sam Hopper', phone: '318-267-2288', role: 'Son'),
  Member(id: 'm35', name: 'Hayden Hopper', phone: '318-267-2927', role: 'Son'),
  Member(id: 'm36', name: 'Drew Carson', phone: '318-205-0191', role: 'Member', shares: '29'),
];

Member? memberById(String id) => kMembers.firstWhereOrNull((m) => m.id == id);
