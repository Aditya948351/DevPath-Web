
import ProfileClient from './client';

export function generateStaticParams() {
    return [{ uid: 'public' }];
}

export default function PublicProfilePage() {
    return <ProfileClient />;
}
