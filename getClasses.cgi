#!/usr/bin/python
import MySQLdb as mdb
import sys
import cgi

print "Content-type: text\html\n"
print "{"

form = cgi.FieldStorage()

id = "1"
if form.has_key('id'):
   id = form['id'].value

try:

   con = mdb.connect('localhost', 'dlin', 'dlin2dlin', 'dlin')
   sql= "select charname, class FROM CharactersAndClasses WHERE charid=" + id

   with con:
     cur=con.cursor(mdb.cursors.DictCursor)
     cur.execute(sql)
     rows=cur.fetchall()
     print "\"name\":\"" + str(rows[0]["charname"]) + "\","
     print "\"classes\":["
     
     count = len(rows)
     for row in rows:
       count -= 1
       print "{\"class\":\"" + str(row["class"]) + "\"}"
       if count:
         print ","
#     print "\"ResGrowth\":\"" + str(row["ResGrowth"]) + "\""
     print "]"
except mdb.Error, e:
   print "Error %d: %s" % (e.args[0],e.args[1])
   sys.exit(1)
finally:    
   if con:    
      con.close()

print "}"
