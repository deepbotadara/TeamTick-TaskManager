# Quick Start: Create Database Tables

## Step-by-Step Instructions

### Option 1: Using MySQL Command Line (Recommended)

**1. Open Command Prompt or Terminal**

**2. Navigate to your project folder:**
```bash
cd "d:\Darshan University\Sem-6\AWT\Project"
```

**3. Run the schema script:**
```bash
mysql -u root -proot todo_list < database/schema.sql
```

**4. (Optional) Add sample data:**
```bash
mysql -u root -proot todo_list < database/seed-data.sql
```

### Option 2: Using MySQL Workbench

**1. Open MySQL Workbench**

**2. Connect to your database:**
- Host: localhost
- Username: root
- Password: root

**3. Select the `todo_list` database**

**4. Open and execute `schema.sql`:**
- File → Open SQL Script
- Navigate to: `d:\Darshan University\Sem-6\AWT\Project\database\schema.sql`
- Click the lightning bolt icon to execute

**5. (Optional) Open and execute `seed-data.sql` the same way**

### Option 3: Copy-Paste into MySQL Client

**1. Connect to MySQL:**
```bash
mysql -u root -proot
```

**2. Select the database:**
```sql
USE todo_list;
```

**3. Copy the entire content from `database/schema.sql` and paste it into the MySQL prompt, then press Enter**

## Verify Tables Were Created

```bash
mysql -u root -proot -e "USE todo_list; SHOW TABLES;"
```

You should see:
```
+---------------------+
| Tables_in_todo_list |
+---------------------+
| Projects            |
| Roles               |
| TaskComments        |
| TaskHistory         |
| TaskLists           |
| Tasks               |
| UserRoles           |
| Users               |
+---------------------+
```

## View Table Structure

```bash
mysql -u root -proot -e "USE todo_list; DESCRIBE Users;"
```

## Troubleshooting

**Error: "Access denied"**
- Check username and password are correct
- Make sure MySQL server is running

**Error: "Unknown database 'todo_list'"**
- Create the database first: `CREATE DATABASE todo_list;`

**Error: "Table already exists"**
- Drop existing tables first or use a different database name

## Next Steps

After creating the tables:
1. ✅ Verify all tables exist
2. ✅ Check table structures
3. 🔧 Configure Next.js database connection
4. 📝 Create API endpoints
