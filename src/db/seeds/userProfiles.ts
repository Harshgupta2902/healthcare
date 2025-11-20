import { db } from '@/db';
import { userProfiles } from '@/db/schema';

async function main() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sampleUserProfiles = [
        {
            userId: 'test-user-001',
            phone: '+1-555-0123',
            dateOfBirth: '1985-06-15',
            gender: 'Male',
            bloodType: 'O+',
            height: '175',
            weight: '75',
            address: '123 Main Street, Apt 4B',
            city: 'San Francisco',
            state: 'California',
            postalCode: '94102',
            emergencyContactName: 'Sarah Johnson',
            emergencyContactPhone: '+1-555-0199',
            emergencyContactRelationship: 'Spouse',
            profilePhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test-user-001',
            createdAt: thirtyDaysAgo.toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(userProfiles).values(sampleUserProfiles);
    
    console.log('✅ User profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});