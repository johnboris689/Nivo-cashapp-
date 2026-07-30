import avatarGoldVip from '../assets/images/avatar_gold_vip_1785403053037.jpg';
import avatarBlueTech from '../assets/images/avatar_blue_tech_1785403067469.jpg';
import avatarEmeraldPro from '../assets/images/avatar_emerald_pro_1785403080799.jpg';
import avatarOrangeCyber from '../assets/images/avatar_orange_cyber_1785403096818.jpg';

export interface DefaultAvatar {
  id: string;
  name: string;
  tag: string;
  url: string;
}

export const DEFAULT_AVATARS: DefaultAvatar[] = [
  {
    id: 'gold_vip',
    name: 'Gold VIP',
    tag: 'Premium Gold',
    url: avatarGoldVip,
  },
  {
    id: 'blue_tech',
    name: 'Cyber Founder',
    tag: 'Neon Tech',
    url: avatarBlueTech,
  },
  {
    id: 'emerald_pro',
    name: 'Emerald Trader',
    tag: 'Executive',
    url: avatarEmeraldPro,
  },
  {
    id: 'orange_cyber',
    name: 'Nivo Legend',
    tag: 'Cyberpunk',
    url: avatarOrangeCyber,
  },
];
