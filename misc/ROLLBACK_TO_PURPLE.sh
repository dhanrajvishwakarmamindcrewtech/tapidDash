#!/bin/bash
# ROLLBACK SCRIPT: Revert from Teal/Green back to Original Purple Scheme
# Run this script if you want to go back to the original purple colors

echo "🔄 Rolling back to original purple color scheme..."

# Revert primary colors
find src -name "*.css" -type f -exec sed -i '' 's/#008A9B/#7950f2/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/#00BD84/#9775fa/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/#67EF71/#a685fa/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/#006B7A/#845ef7/g' {} \;

# Revert background tints
find src -name "*.css" -type f -exec sed -i '' 's/#f0fffe/#f3f0ff/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/#e8fbf9/#e9d5ff/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/#f8fefd/#f8f4ff/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/#f4fefa/#f0ebff/g' {} \;

# Revert rgba values
find src -name "*.css" -type f -exec sed -i '' 's/rgba(0,138,155/rgba(121,80,242/g' {} \;
find src -name "*.css" -type f -exec sed -i '' 's/rgba(0, 138, 155/rgba(142, 124, 240/g' {} \;

# Revert variable names
find src -name "*.css" -type f -exec sed -i '' 's/--nudge-teal/--nudge-purple/g' {} \;

echo "✅ Rollback complete! Original purple scheme restored."
echo "🔍 Check your dashboard to confirm the changes." 