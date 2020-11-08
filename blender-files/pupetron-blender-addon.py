bl_info = {
    "name": "Pupetron server",
    "author": "Ivi Hasanaj",
    "blender": (2, 80, 0),
    "version": (0, 1, 0),
    "description": "Controll Blender objects using Pupetron",
    "category": "Import-Export"
}

import atexit
import bpy
import eventlet
import socketio
import time, threading, mathutils

sio = socketio.Server(async_mode='eventlet',async_handlers=True)
app = socketio.WSGIApp(sio)

@sio.event
def connect(sid, environ):
    print('connect', sid)

@sio.event
def getSelected(sid, data):
    print('getSelected')
    sio.emit('data', {'event': 'getSelected','selections':[o.name for o in bpy.context.scene.objects if o.select_get()]}, room=sid)

@sio.event
def move(sid, data):
    print("data: ",data)
    if data["obj"] in bpy.data.objects:
        obj = bpy.data.objects[data["obj"]]
        posDict = data["pos"]
        vec = mathutils.Vector((posDict["x"], posDict["y"], posDict["z"]))
        inv = obj.matrix_world.copy()
        inv.invert()
        vec_rot = vec @ inv
        if obj is not None:
            obj.location = obj.location + vec_rot
            obj.keyframe_insert(data_path = "location",index = -1)

@sio.event
def disconnect(sid):
    print('disconnect', sid)

soc = None
def thread_update():
    global soc
    soc = eventlet.listen(('', 3001))
    eventlet.wsgi.server(soc, app)

def closeSocket():
    print("Exit")
    global soc
    soc.close()
    eventlet.sleep(1)

class INTERFACE_OT_quit_withfx(bpy.types.Operator):
    bl_idname = "wm.quit_with_sidefx"
    bl_label = "Quit Blender and Pupetron"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        print("execute")
        global soc
        soc.close()
        global eventlet
        eventlet.sleep(1)
        bpy.ops.wm.quit_blender()
        return {'FINISHED'}

def register():
    bpy.utils.register_class(INTERFACE_OT_quit_withfx)
    thread = threading.Thread(target=thread_update)
    thread.start()
    atexit.register(closeSocket)

def unregister():
    bpy.utils.unregister_class(INTERFACE_OT_quit_withfx)
    global soc
    soc.close()
    eventlet.sleep(1)

