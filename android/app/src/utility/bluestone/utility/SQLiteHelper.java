package bluestone.utility;

/**
 * Created by xiaqr on 2017/9/26.
 */

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import java.lang.reflect.Field;
import java.lang.reflect.Method; 
import java.util.LinkedList;
import java.util.List;

public class SQLiteHelper
{
    private String dbPath;

    public SQLiteHelper(String dbPath)
    {
        this.dbPath=dbPath;
    }

    private SQLiteDatabase openDB()
    {
        SQLiteDatabase  db = SQLiteDatabase.openOrCreateDatabase(dbPath,null);
        return  db;
    }
    public void createDB()
    {
        SQLiteDatabase  db = SQLiteDatabase.openOrCreateDatabase(dbPath,null);
        db.close();
    }

    public <T extends Object> List<T> ExecuteList(Class<T> type, String sqlText)
    {
        SQLiteDatabase  db =null;
        Cursor result = null;
        try
        {
            db = openDB();
            result= db.query("",new String[1],"",new String[2],null,null,null);

            List<T> list = new LinkedList<T>();
            while(result.moveToNext())
            {
                T tInfo = (T)type.newInstance();
                list.add(tInfo);
                Field[] fields = type.getFields();
                for(Field f:fields)
                {
                    String fName = f.getName();
                    int colIndex = result.getColumnIndex(fName);
                    Class<?> t = f.getType();
                    if(t==String.class)
                    {
                        String value = result.getString(colIndex);
                        f.set(tInfo, value);
                    }
                    else if(t== int.class)
                    {
                        int value = result.getInt(colIndex);
                        f.setInt(tInfo, value);
                    }
                    else if(t== short.class)
                    {
                        short value = result.getShort(colIndex);
                        f.setShort(tInfo, value);
                    }
                    else if(t== long.class)
                    {
                        long value = result.getLong(colIndex);
                        f.setLong(tInfo, value);
                    }
                    else if(t== float.class)
                    {
                        float value = result.getFloat(colIndex);
                        f.setFloat(tInfo, value);
                    }
//                    else if(t== byte.class)
//                    {
//                        byte value = rs.getByte(colIndex);
//                        f.setByte(tInfo, value);
//                    }
                    else if(t== char.class)
                    {
                        char value = (char)result.getShort(colIndex);
                        f.setChar(tInfo, value);
                    }
                    else
                    {
                        String value = result.getString(colIndex);
                        f.set(tInfo, value);
                    }
                }
                Method[] methods = type.getMethods();

                for(Method m:methods)
                {
                    String mName =m.getName();
                    String fName = null;
                    if(mName.toLowerCase().startsWith("set"))
                    {
                        fName = mName.substring(3);
                    }
                    else{
                        continue;
                    }
                    int colIndex = result.getColumnIndex(fName);
                    Class<?>[] ts = m.getParameterTypes();
                    if(ts!=null && ts.length==1)
                    {
                        Class<?>t= ts[0];

                        if(t==String.class)
                        {
                            String value = result.getString(colIndex);
                            m.invoke(tInfo, value);
                        }
                        else if(t== int.class)
                        {
                            int value = result.getInt(colIndex);
                            m.invoke(tInfo, value);
                        }
                        else if(t== short.class)
                        {
                            short value = result.getShort(colIndex);
                            m.invoke(tInfo, value);
                        }
                        else if(t== long.class)
                        {
                            long value = result.getLong(colIndex);
                            m.invoke(tInfo, value);
                        }
                        else if(t== float.class)
                        {
                            float value = result.getFloat(colIndex);
                            m.invoke(tInfo, value);
                        }
//                        else if(t== byte.class)
//                        {
//                            byte value = rs.getByte(colIndex);
//                            m.invoke(tInfo, value);
//                        }
                        else if(t== char.class)
                        {
                            char value = (char)result.getShort(colIndex);
                            m.invoke(tInfo, value);
                        }
                        else
                        {
                            String value = result.getString(colIndex);
                            m.invoke(tInfo, value);
                        }
                    }

                }
            }
            return list;
        }
        catch(Exception ex)
        {
            // Log the exception;
        }
        finally
        {
                if(result!=null){
                    result.close();
                }
                if(db!=null)
                {
                    db.close();
                }
            // Log the exception;
        }
        return null;
    }

    public void Execute(String sqlText)
    {
            SQLiteDatabase db= openDB();
            db.execSQL(sqlText);
    }
}
