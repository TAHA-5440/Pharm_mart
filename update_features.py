import re

file_path = '/home/mujahid/ERP_SRP/Pharm_mart/ProcureX_Marketplace_Must_Have_Features.md'

with open(file_path, 'r') as f:
    content = f.read()

done_keywords = [
    "Separate buyer and supplier onboarding",
    "Company-based accounts, not only individual user accounts",
    "Multiple team members under one company",
    "Company approval workflow by admin",
    "Verified business badge",
    "NTN / company registration details",
    "Relevant licenses and certificates",
    "Admin verification workflow",
    "Company logo and banner",
    "Company overview",
    "Industries served",
    "Product catalog",
    "Machinery listings",
    "Services",
    "Brands represented",
    "Certificates",
    "Catalogues",
    "Locations served",
    "Request Quote button",
    "Message Supplier button",
    "Search suppliers",
    "Search products",
    "Search machinery",
    "Filter by industry",
    "Filter by category",
    "Filter by city/location",
    "Filter by condition:",
    "New",
    "Used",
    "Refurbished",
    "Product/service title",
    "Technical specifications",
    "Quantity",
    "Required delivery date",
    "Location",
    "Budget, optional",
    "RFQ closing date",
    "Admin moderation status",
    "Category match",
    "Industry match",
    "Supplier verification",
    "Price",
    "Delivery period",
    "Warranty",
    "Quote validity",
    "Technical notes",
    "PDF quotation attachment",
    "Buyer shortlist / accept / reject workflow",
    "Buyer-to-supplier chat",
    "RFQ-linked conversations",
    "Conversation history",
    "Machine title",
    "Manufacturer",
    "Model",
    "Year",
    "Serial number",
    "Condition",
    "Working status",
    "Negotiable / fixed price",
    "Photos",
    "Videos",
    "Inspection availability",
    "Seller verification",
    "Active RFQs",
    "Quotations received",
    "Messages",
    "Saved suppliers",
    "Saved machinery",
    "Previous RFQs",
    "Previous quotations",
    "Team members",
    "Notifications",
    "New matched RFQs",
    "Submitted quotations",
    "Profile views",
    "Suppliers",
    "Machinery",
    "In-app notifications",
    "Users",
    "Companies",
    "Buyers",
    "Supplier approvals",
    "Verification",
    "RFQs",
    "Quotations",
    "Product listings",
    "Categories",
    "Brands",
    "Approve or reject suppliers",
    "Approve or reject machinery",
    "Images",
    "PDF",
    "Role-based permissions",
    "Secure password storage",
    "RFQ created",
    "Quote submitted",
    "Budget",
]

lines = content.split('\n')
new_lines = []

for line in lines:
    if line.strip().startswith('- '):
        # Check if it's already a checkbox
        if line.strip().startswith('- [ ]') or line.strip().startswith('- [x]'):
            new_lines.append(line)
            continue
            
        is_done = False
        for kw in done_keywords:
            if kw.lower() in line.lower():
                is_done = True
                break
        
        # Replace the first '- ' with '- [x] ' or '- [ ] '
        if is_done:
            new_line = line.replace('- ', '- [x] ', 1)
        else:
            new_line = line.replace('- ', '- [ ] ', 1)
        new_lines.append(new_line)
    else:
        new_lines.append(line)

with open(file_path, 'w') as f:
    f.write('\n'.join(new_lines))

print("Updated features list.")
