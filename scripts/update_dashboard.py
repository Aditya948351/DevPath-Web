
import os

file_path = r'src/components/admin/AdminDashboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the start and end of the function to replace
start_marker = 'const handleRecalculateAll = async () => {'
end_marker = 'setMigrating(false);'

# Find start
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Start marker not found!")
    exit(1)

# Find end (it's inside the finally block at the end of the function)
# We need to be careful. The function ends with:
#         } finally {
#             setMigrating(false);
#         }
#     };

# Let's find the closing brace of the function.
# We can search for the next "};" after the start, but there might be nested ones.
# Instead, let's replace the specific block we know is there.

# We want to replace everything inside the try block basically.

new_logic = """    const handleRecalculateAll = async () => {
        if (!confirm("Are you sure you want to RECALCULATE ALL BADGES & POINTS for ALL USERS? This disregards the 24h limit.")) return;

        setMigrating(true);
        setMigrationLog(['Starting Full Recalculation...']);

        try {
            const membersRef = collection(db, 'members');
            const snapshot = await getDocs(membersRef);
            const batch = (await import('firebase/firestore')).writeBatch(db);
            let count = 0;
            let batchCount = 0;

            setMigrationLog((prev: string[]) => [...prev, `Found ${snapshot.size} members.`]);

            for (const memberDoc of snapshot.docs) {
                const data = memberDoc.data();
                const uid = memberDoc.id;
                
                // Fetch Projects for this user
                const projectsRef = collection(db, 'members', uid, 'projects');
                const projectsSnap = await getDocs(projectsRef);
                const userProjects = projectsSnap.docs.map(doc => doc.data());

                // Calculate using shared logic
                const result = calculateUserPointsAndBadges({ uid, ...data }, userProjects);

                // Update Member
                const memberRef = doc(db, 'members', uid);
                batch.update(memberRef, { 
                    points: result.points,
                    achievements: result.achievements,
                    lastBadgeScan: Date.now() // Reset scan time
                });

                // Update Leaderboard
                const leaderboardRef = doc(db, 'leaderboard', uid);
                batch.set(leaderboardRef, { points: result.points }, { merge: true });

                count++;
                batchCount++;
                if (batchCount >= 400) {
                    await batch.commit();
                    setMigrationLog((prev: string[]) => [...prev, `Processed ${count} users...`]);
                    batchCount = 0;
                }
            }
            
            // Commit remaining
            if (batchCount > 0) {
                 await batch.commit();
            }

            setMigrationLog((prev: string[]) => [...prev, `Recalculation Complete. Processed ${count} users.`]);
            alert("Recalculation Complete!");

        } catch (error) {
            console.error("Recalculation failed:", error);
            setMigrationLog((prev: string[]) => [...prev, `Fatal Error: ${error}`]);
            alert("Recalculation failed.");
        } finally {
            setMigrating(false);
        }
    };"""

# We will replace the existing function with this new one.
# We need to find where the existing function ends.
# It starts at start_idx.
# We can assume it ends at the next "};" that is at the root indentation level (4 spaces).
# But indentation might vary.

# Let's try to match the exact string of the OLD function if possible.
# But we don't have it easily.

# Alternative: We know the function starts at `start_idx`. 
# We can iterate lines from there and count braces to find the end.

lines = content.split('\n')
func_start_line = -1
for i, line in enumerate(lines):
    if start_marker in line:
        func_start_line = i
        break

if func_start_line == -1:
    print("Function start line not found")
    exit(1)

# Count braces to find end
brace_count = 0
func_end_line = -1
found_start = False

for i in range(func_start_line, len(lines)):
    line = lines[i]
    brace_count += line.count('{')
    brace_count -= line.count('}')
    
    if brace_count > 0:
        found_start = True
    
    if found_start and brace_count == 0:
        func_end_line = i
        break

if func_end_line == -1:
    print("Function end line not found")
    exit(1)

print(f"Replacing lines {func_start_line} to {func_end_line}")

# Replace lines
new_lines = lines[:func_start_line] + new_logic.split('\n') + lines[func_end_line+1:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("Successfully updated AdminDashboard.tsx")
